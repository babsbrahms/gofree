import React from 'react';
import { Portal, Segment, Header, Icon } from "semantic-ui-react";

const TagView = ({close, tagData, children, title}) => {
    return (
        <div>
            <Portal
                onClose={() => close()}
                open={tagData.open}
                closeOnDocumentClick={false}
            >
                <Segment 
                style={{
                    position: 'fixed',
                    zIndex: 700,
                    top: "0%",
                    left: "0%",
                   // width: "50%",
                    height: "100%"
                }}>
                    <Header>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                            <Header.Content>{title.toUpperCase()}</Header.Content>
                            <Icon link name="close" color="red" onClick={() => close()}/>    
                        </div>
                    </Header>

                    {tagData.open && (
                        <div style={{ overflowY: 'scroll', height: '95%', padding: '3px', }}>
                            {children}
                        </div>   
                    )}

                </Segment>
            </Portal>
        </div>
    )
}

export default TagView
