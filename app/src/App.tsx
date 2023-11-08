import { useState } from 'react';

import init, { runBevyApp } from './assets/wasm-canvas';

import { SuiClient } from '@mysten/sui.js/client';

import { getObject3D, getObjectTree } from './rpc-calls/objects';
import { DEFAULT_OBJECT_ID, SUI_NETWORK } from './config';

import './App.css'


function App() {

    const [rootObjectId, setRootObjectId] = useState<string>(DEFAULT_OBJECT_ID);

    // useEffect(() => {
    //     const suiClient = new SuiClient({ url: SUI_NETWORK });
    //     getObjectTree(suiClient, rootObjectId).then((node) => {
    //         console.log(node);
    //     });
    // }, [rootObjectId]);
    async function runBevyAppClicked() {
        const suiClient = new SuiClient({ url: SUI_NETWORK });
        const getObjectResp = await getObject3D(suiClient, rootObjectId);
        if (!getObjectResp) {
            console.error("Could not get object");
            return;
        }
        const object3D = getObjectResp.object3D;
        const rootNode = await getObjectTree(suiClient, rootObjectId);
        console.log(rootNode);
        await init();
        runBevyApp(
            "#mycanvas",
            () => { return object3D; },
            () => { return rootNode; }
        );
    }

    return (
        <>
            <div className='App'>
                <input type="text" value={rootObjectId} onChange={(e) => setRootObjectId(e.target.value)} />
                <button onClick={runBevyAppClicked}>Run Bevy App</button>
            </div>
            <canvas id="mycanvas" />
        </>
    );
}

export default App
