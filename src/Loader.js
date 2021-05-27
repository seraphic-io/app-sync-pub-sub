import React from 'react';
import Lottie from 'react-lottie';
import * as animationData from './62235-load.json'

function Loader(props) {
    const defaultOptions = {
        loop: true,
        autoplay: true, 
        animationData: animationData.default,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
    };
    return (
        <React.Fragment>
            {
                props.isLoading
                ? <div className="loader-container">
                    <Lottie 
                        options={defaultOptions}
                        height={400}
                        width={400}
                    />
                </div> 
              : null  
            }
             
        </React.Fragment>          
    );
}
  
export default Loader;