<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use Google\Client;
use Google\Service;
use Google\Service\PeopleService;
use Google\Service\PeopleService\Name;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

const CUSTOM_FIELD_NAME = 'asgss_member_id';
const GROUPS = [
    'member' => 'AAA_SOCI',
    'student_member' => 'AAA_STUDENTI',
    'pre_enrolled' => 'AAA_PREISCRITTI'
];

class ContactsSyncController extends Controller
{
    public function main(Request $request)
    {
        $this->authorize('sync', Email::class);

        return Inertia::render('Contacts/Main');
    }

    public function getMembers()
    {
        $this->authorize('sync', Email::class);

        $data = Alumnus::whereIn('status', Alumnus::public_status)
            ->where('coorte', '>', 0) // exclude onorari
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->with('emails')
            ->get();

        return response()->json($data);
    }

    private function parsePerson($person)
    {
        $parsed = [
            'id' => $person->getResourceName(),
            'etag' => $person->getETag(),
            'name' => $person->getNames()[0]->getDisplayName(),
            'emails' => []
        ];
        foreach ($person->getExternalIds() as $exid) {
            if ($exid->getType() == CUSTOM_FIELD_NAME) {
                $parsed['member_id'] = $exid->getValue();
            }
        }
        foreach ($person->getEmailAddresses() as $em)
            $parsed['emails'][] = $em->getValue();
        return $parsed;
    }

    public function getContacts()
    {
        $this->authorize('sync', Email::class);

        $peopleService = $this->getPeopleService();

        $queryDetails = [
            'personFields' => 'names,emailAddresses,externalIds',
            'pageSize' => 100
        ];

        $data = $peopleService->people_connections->listPeopleConnections('people/me', $queryDetails);
        $connections = $data->getConnections();
        while (1) {
            $data = $peopleService->people_connections->listPeopleConnections('people/me', array_merge($queryDetails, [
                'pageToken' => $data->getNextPageToken()
            ]));
            $connections = array_merge($connections, $data->getConnections());
            if (!$data->getNextPageToken()) break;
        }

        $output = [];
        foreach ($connections as $connection) {
            if (count($connection->getNames()) > 0) {
                $output[$connection->getResourceName()] = $this->parsePerson($connection);
            }
        }

        $groups_data = $peopleService->contactGroups->listContactGroups();
        $groups_list = [];
        foreach ($groups_data->getContactGroups() as $group) {
            if ($group->getGroupType() != 'USER_CONTACT_GROUP') continue;

            $key = array_search($group->getName(), GROUPS);
            if ($key === false) continue;

            $groups_list[$key] = [
                'id' => $group->getResourceName(),
                'name' => $group->getName(),
                'members' => []
            ];

            $group_details = $peopleService->contactGroups->get($group->getResourceName(), [
                'maxMembers' => count($connections)
            ]);

            if (!$group_details->getMemberResourceNames()) continue;
            foreach ($group_details->getMemberResourceNames() as $memberId) {
                $groups_list[$key]['members'][] = $memberId;
            }
        }
        foreach (GROUPS as $key => $group) {
            if (!array_key_exists($key, $groups_list)) {
                $draft = new \Google\Service\PeopleService\ContactGroup();
                $draft->setName(GROUPS[$key]);

                $rqt = new \Google\Service\PeopleService\CreateContactGroupRequest();
                $rqt->setContactGroup($draft);

                $group = $peopleService->contactGroups->create($rqt);

                $groups_list[$key] = [
                    'id' => $group->getResourceName(),
                    'name' => $group->getName(),
                    'members' => []
                ];
            }
        }

        return response()->json([
            'groups' => $groups_list,
            'contacts' => array_values($output)
        ]);
    }

    public function deassociate(Request $request)
    {
        $this->authorize('sync', Email::class);

        $item = $request->input('item');

        $peopleService = $this->getPeopleService();

        $etag = $peopleService->people->get($item, ['personFields' => 'names'])->getEtag();

        $updatedVersion = new \Google\Service\PeopleService\Person();
        $updatedVersion->setEtag($etag);
        $updatedVersion->setExternalIds([]);

        $peopleService->people->updateContact(
            $item,
            $updatedVersion,
            ['updatePersonFields' => 'externalIds']
        );
        return response()->json([]);

    }

    public function associate(Request $request)
    {
        $this->authorize('sync', Email::class);

        $item = $request->input('item');

        $peopleService = $this->getPeopleService();

        $etag = $peopleService->people->get($item['res_id'], ['personFields' => 'names'])->getEtag();

        $updatedVersion = new \Google\Service\PeopleService\Person();
        $updatedVersion->setEtag($etag);

        $newId = new \Google\Service\PeopleService\ExternalId();
        $newId->setValue($item['member_id']);
        $newId->setType(CUSTOM_FIELD_NAME);
        $newId->setFormattedType(CUSTOM_FIELD_NAME);

        $updatedVersion->setExternalIds([$newId]);

        $peopleService->people->updateContact(
            $item['res_id'],
            $updatedVersion,
            ['updatePersonFields' => 'externalIds']
        );

        return response()->json();
    }

    public function create(Request $request)
    {
        $this->authorize('sync', Email::class);

        $item = $request->input('item');

        $peopleService = $this->getPeopleService();

        $alumnus = Alumnus::find($item);
        if (!$alumnus) return response()->json([]);

        $newPerson = new \Google\Service\PeopleService\Person();

        $name = new Name();
        $name->setGivenName($alumnus->name);
        $name->setFamilyName($alumnus->surname);
        $newPerson->setNames([$name]);

        $newId = new \Google\Service\PeopleService\ExternalId();
        $newId->setValue($item);
        $newId->setType(CUSTOM_FIELD_NAME);
        $newId->setFormattedType(CUSTOM_FIELD_NAME);
        $newPerson->setExternalIds([$newId]);

        $person = $peopleService->people->createContact($newPerson, ['personFields' => 'names,emailAddresses,externalIds']);

        return response()->json( $this->parsePerson($person) );
    }

    public function addOnPortal(Request $request)
    {
        $this->authorize('sync', Email::class);

        $item = $request->input('item');

        $alumnus = Alumnus::find($item['member_id']);
        if (!$alumnus) return;

        // Check for unicity
        if ($alumnus->emails()->where('address', $item['address'])->exists()) return;

        $alumnus->emails()->create(['address' => $item['address']]);

        return response()->json([]);
    }

    public function addOnGoogle(Request $request)
    {
        $this->authorize('sync', Email::class);

        $item = $request->input('item');

        $resid = $item['contact'];
        $address = $item['address'];

        $peopleService = $this->getPeopleService();

        $person = $peopleService->people->get($resid, ['personFields' => 'emailAddresses']);

        $newEmail = new \Google\Service\PeopleService\EmailAddress();
        $newEmail->setValue($address);

        $person->setEmailAddresses(array_merge($person->getEmailAddresses(), [$newEmail]));

        $peopleService->people->updateContact($resid, $person, ['updatePersonFields' => 'emailAddresses']);

        return response()->json([]);
    }

    public function modifyGroup(Request $request)
    {
        $this->authorize('sync', Email::class);

        $groupId = $request->input('groupId');
        $toAdd = $request->input('toAdd');
        $toRemove = $request->input('toRemove');

        $peopleService = $this->getPeopleService();

        $rb = new \Google\Service\PeopleService\ModifyContactGroupMembersRequest();
        $rb->setResourceNamesToAdd($toAdd);
        $rb->setResourceNamesToRemove($toRemove);

        $peopleService->contactGroups_members->modify($groupId, $rb);

        return response()->json([]);
    }


    private function getPeopleService()
    {
        $client = new Client();
        $access = Auth::user();

        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setAccessToken($access->token);

        $client->addScope(\Google\Service\PeopleService::CONTACTS);

        return new \Google\Service\PeopleService($client);
    }
}
