import React, { useState } from 'react';

export const KanbanCard = ({ children, id }) => {
    const [isDragging, setDragging] = useState(false);
    const dragStart = (e, id) => {
        e.dataTransfer.setData("card_id", id)
        setDragging(true)
    }

    const dragOver = (e) => {
        // e.stopPropagation();
    }

    const dragEnd = () => {
        setDragging(false)
    }


    return (
        <div 
            draggable={true}
            onDragStart={(e) => dragStart(e, id)}
            onDragOver={(e) => dragOver(e)}
            onDragEnd={(e) => dragEnd(e)}
            style={{
                userSelect: "none",
                padding: 3,
                borderRadius: 5,
                margin: "0 0 8px 0",
                minHeight: "50px",
                backgroundColor: isDragging
                    ? "#456C86"
                    : "#00b5ad",
                }}
        >
            {children}
        </div>
    )
}




export const KanbanColumn = ({ children, changeCol }) => {
    const [isDraggingOver, setDragover] = useState(false);

    const dragEnter = () => {
        setDragover(true)
    }

    const dragLeave = () => {
        setDragover(false)
    }

    const dragOver = (e) => {
        e.preventDefault();
        setDragover(true)
    }

    const drop = (e) => {
        let id = e.dataTransfer.getData("card_id")
        setDragover(false)
        changeCol(id)
    }
    return (
        <div
            onDragOver={(e) => dragOver(e)}
            onDrop={(e) => drop(e)}
            onDragEnter={(e) => dragEnter(e)}
            onDragLeave={(e) => dragLeave(e)}
            style={{
                background: isDraggingOver
                    ? "darkgrey"
                    : "#e0e1e2",
                padding: 4,
                width: 250,
                height: 450,
                overflowY: "auto",
                borderRadius: 5
            }}
        >
           {children} 
        </div>
    )
}
