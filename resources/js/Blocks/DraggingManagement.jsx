import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS as CSS_DND } from '@dnd-kit/utilities';

function SortableItem({ id, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id });

    const style = {
        transform: CSS_DND.Transform.toString(transform),
        transition,
    };

    return (
        <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full">
            { children }
        </li>
    );
}


export default function DraggingManagement({ list, updateOrder, renderItem }) {

    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5
        }
    });


    const onDragEnd = (event) => {
        const { active, over } = event;
        if (active.data.current.sortable.index == over.data.current.sortable.index) return
        updateOrder(active.data.current.sortable.index, over.data.current.sortable.index)
    }

    const { setNodeRef } = useDroppable({
        id: 'droppable_area',
    });


    return <DndContext onDragEnd={onDragEnd} collisionDetection={closestCenter} sensors={useSensors(sensor)}>
        <ul ref={setNodeRef} className="w-full flex flex-col gap-2">
            <SortableContext items={list} strategy={verticalListSortingStrategy}>
                {list?.map((item, index) =>
                    <SortableItem key={item.id} id={"" + item.id}>
                        {renderItem(item, index)}
                    </SortableItem>
                )}
            </SortableContext>
        </ul>
    </DndContext>
}