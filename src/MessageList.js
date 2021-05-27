import React, { useEffect, useState } from 'react';

function MessageList(props) {
    return (
      <div>
        {
            props.list.map((message, index) => {
                return <p key={`message-${index}`}> {message.text}</p>   
            })
        }
      </div>
    );
}
  
export default MessageList;