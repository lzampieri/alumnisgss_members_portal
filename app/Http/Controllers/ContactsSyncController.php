<?php

namespace App\Http\Controllers;

use App\Models\Alumnus;
use App\Models\Email;
use App\Models\Person;
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

    public function getLocal()
    {
        $this->authorize('sync', Email::class);

        $data = Person::whereIn('status', Alumnus::public_status)
            ->where('coorte', '>', 0) // exclude onorari and external
            ->orderBy('coorte')
            ->orderBy('surname')->orderBy('name')
            ->with('emails')
            ->get()
            ->makeVisible('emails');

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
        $emails = $person->getEmailAddresses();
        usort($emails, function ($a, $b) {
            return $b->getMetadata()->primary - $a->getMetadata()->primary;
        });

        foreach ($emails as $em)
            $parsed['emails'][] = $em->getValue();
        return $parsed;
    }

    public function getGoogle()
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

        return response()->json(array_values($output));
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

        $etag = $peopleService->people->get($item['google_id'], ['personFields' => 'names'])->getEtag();

        $updatedVersion = new \Google\Service\PeopleService\Person();
        $updatedVersion->setEtag($etag);

        $newId = new \Google\Service\PeopleService\ExternalId();
        $newId->setValue(strval($item['local_id']));
        $newId->setType(CUSTOM_FIELD_NAME);
        $newId->setFormattedType(CUSTOM_FIELD_NAME);

        $updatedVersion->setExternalIds([$newId]);

        $peopleService->people->updateContact(
            $item['google_id'],
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

        $alumnus = Person::find($item);
        if (!$alumnus) return response()->json([]);

        $newPerson = new \Google\Service\PeopleService\Person();

        $name = new Name();
        $name->setGivenName($alumnus->name);
        $name->setFamilyName($alumnus->surname);
        $newPerson->setNames([$name]);

        $newId = new \Google\Service\PeopleService\ExternalId();
        $newId->setValue(strval($item));
        $newId->setType(CUSTOM_FIELD_NAME);
        $newId->setFormattedType(CUSTOM_FIELD_NAME);
        $newPerson->setExternalIds([$newId]);

        $person = $peopleService->people->createContact($newPerson, ['personFields' => 'names,emailAddresses,externalIds']);

        return response()->json($this->parsePerson($person));
    }

    public function addOnPortal(Request $request)
    {
        $this->authorize('sync', Email::class);

        $item = $request->input('item');

        $alumnus = Person::find($item['local_id']);
        if (!$alumnus) return;

        // Check for unicity
        if ($alumnus->emails()->where('address', $item['address'])->exists()) return;

        $alumnus->emails()->create(['address' => $item['address']]);

        $newProfile = Person::where('id',$item['local_id'])
            ->with('emails')
            ->get()
            ->makeVisible('emails');

        return response()->json(['pair_id' => $item['pair_id'], 'local' =>  $newProfile]);
    }

    public function addOnGoogle(Request $request)
    {
        $this->authorize('sync', Email::class);

        $item = $request->input('item');

        $resid = $item['google_id'];
        $address = $item['address'];

        $peopleService = $this->getPeopleService();

        $person = $peopleService->people->get($resid, ['personFields' => 'emailAddresses']);

        $newEmail = new \Google\Service\PeopleService\EmailAddress();
        $newEmail->setValue($address);

        $person->setEmailAddresses(array_merge($person->getEmailAddresses(), [$newEmail]));

        $peopleService->people->updateContact($resid, $person, ['updatePersonFields' => 'emailAddresses']);

        $person = $peopleService->people->get($resid, ['personFields' => 'names,emailAddresses,externalIds']);

        return response()->json(['pair_id' => $item['pair_id'], 'google' => $this->parsePerson($person)]);
    }

    public function priorOnPortal(Request $request)
    {
        $this->authorize('sync', Email::class);

        $item = $request->input('email');

        $e = Email::where('address', $item)->first();
        if (!$e) return;

        $e->primary = max($e->identity->emails()->pluck('emails.primary')->toArray()) + 1;
        $e->save();

        return response()->json([]);
    }



    public function priorOnGoogle(Request $request)
    {
        $this->authorize('sync', Email::class);

        $resid = $request->input('resId');
        $email = $request->input('email');

        $peopleService = $this->getPeopleService();

        $person = $peopleService->people->get($resid, ['personFields' => 'emailAddresses']);

        $addresses = $person->getEmailAddresses();

        foreach ($addresses as &$a) {
            $mt = $a->getMetadata();
            $mt->setSourcePrimary(strcmp($a->getValue(), $email) == 0);
            $a->setMetadata($mt);
        }

        $person->setEmailAddresses($addresses);

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
        $access = Auth::user()->logged_in_email;

        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setAccessToken($access->token);

        $client->addScope(\Google\Service\PeopleService::CONTACTS);

        return new \Google\Service\PeopleService($client);
    }
}
