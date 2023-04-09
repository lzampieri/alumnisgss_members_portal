import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import BlockEnvironment from "./BlockEnvironment";


export default function DraggingManagement({ list, updateOrder, renderItem }) {

    let savedApi;

    const onDragEnd = (result) => {
        if (!result.destination) return
        updateOrder(result.source.index, result.destination.index)
    }

    return <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable_area">
            {(provided) =>
                <ul {...provided.droppableProps} ref={provided.innerRef} className="w-full">
                    {list.map((item, index) =>
                        <Draggable key={item.id} draggableId={"" + item.id} index={index}>
                            {(provided) =>
                                <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="w-full">
                                    {renderItem(item, index)}
                                </li>
                            }
                        </Draggable>
                    )}
                    {provided.placeholder}
                </ul>
            }
        </Droppable>
    </DragDropContext>
}