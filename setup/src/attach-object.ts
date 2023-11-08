import { SuiClient, SuiObjectChangeMutated, SuiObjectRef } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/bcs";
import { ADMIN_SECRET_KEY, PACKAGE_ID, SUI_NETWORK } from "./config";
import { cubeWithSlot, cubeWith2Slots } from "./insert-slot";
import { smallDragonWithAnchor, smallHelmetWithAnchor } from "./insert-anchor";

async function attachObject(params: {
    suiClient: SuiClient;
    signer: Ed25519Keypair;
    object: SuiObjectRef;
    slotId: number,
    objectToAttach: SuiObjectRef,
    anchorId: number
}) {
    const {
        suiClient,
        signer,
        object,
        slotId,
        objectToAttach,
        anchorId
    } = params;

    const txb = new TransactionBlock();

    txb.moveCall({
        target: `${PACKAGE_ID}::object3d::attach_to_slot`,
        arguments: [
            txb.objectRef(object),
            txb.pure.u32(slotId),
            txb.objectRef(objectToAttach),
            txb.pure.u32(anchorId),
        ],
    });

    const resp = await suiClient.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        signer,
        requestType: "WaitForLocalExecution",
        options: {
            showEvents: true,
            showInput: true,
            showEffects: true,
            showRawInput: true,
            showObjectChanges: true,
            showBalanceChanges: true,
        },
    });

    if (resp.errors) {
        console.error(JSON.stringify(resp.errors));
        return;
    } else if (resp.effects?.status.status != "success") {
        console.log("Failure executing transaction!");
        console.log(JSON.stringify(resp));
        return;
    }

    return resp.objectChanges?.find((oc) => {
        return oc.type === 'mutated' && oc.objectId ===object.objectId;
    }) as SuiObjectChangeMutated;
}

async function dragonOnTopOfCube() {

    const cube = await cubeWithSlot();
    if (!cube) {
        console.log("Failed to create cube");
        return;
    }
    console.log(cube);
    const dragon = await smallDragonWithAnchor();
    if (!dragon) {
        console.log("Failed to create dragon");
        return;
    }

    const suiClient = new SuiClient({ url: SUI_NETWORK });
    const signer = Ed25519Keypair.fromSecretKey(fromB64(ADMIN_SECRET_KEY).slice(1));

    return attachObject({
        suiClient,
        signer,
        object: cube,
        slotId: 0,
        objectToAttach: dragon,
        anchorId: 0
    });
}

async function dragonAndHelmetOnTopOfCube() {
    const rect = await cubeWith2Slots();
    if (!rect) {
        console.log("Failed to create rect");
        return;
    }
    console.log(`Rect = ${rect.objectId}`);
    const dragon = await smallDragonWithAnchor();
    if (!dragon) {
        console.log("Failed to create dragon");
        return;
    }
    const helmet = await smallHelmetWithAnchor();
    if (!helmet) {
        console.log("Failed to create helmet");
        return;
    }

    const suiClient = new SuiClient({ url: SUI_NETWORK });
    const signer = Ed25519Keypair.fromSecretKey(fromB64(ADMIN_SECRET_KEY).slice(1));

    const updatedRect = await attachObject({
        suiClient,
        signer,
        object: rect,
        slotId: 0,
        objectToAttach: dragon,
        anchorId: 0
    });
    if (!updatedRect) {
        console.log("Failed to attach dragon to rect");
        return;
    }

    return await attachObject({
        suiClient,
        signer,
        object: updatedRect,
        slotId: 1,
        objectToAttach: helmet,
        anchorId: 0
    });
}

const RUN = true;
if (RUN) {
    // dragonOnTopOfCube().then(console.log);
    dragonAndHelmetOnTopOfCube().then(console.log);
}













