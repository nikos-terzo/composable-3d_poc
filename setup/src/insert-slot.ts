import { ObjectOwner, SuiClient, SuiObjectChangeMutated, SuiObjectRef } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/bcs";
import { ADMIN_SECRET_KEY, PACKAGE_ID, SUI_NETWORK } from "./config";
import { CUBE, DRAGON } from "./consts";
import { mintObject } from "./mint-object";

async function insertSlot(params: {
    suiClient: SuiClient;
    signer: Ed25519Keypair;
    objectRef: SuiObjectRef;
    slotId: number,
    slotType: string,
    transformDenominator: number;
    transformRowMajor: number[];
}) {
    const {
        suiClient,
        signer,
        objectRef,
        slotId,
        slotType,
        transformDenominator,
        transformRowMajor,
    } = params;

    if (transformRowMajor.length !== 16) {
        console.log(
            "Transform must be 16 elements long",
        );
        return;
    }

    const txb = new TransactionBlock();

    txb.moveCall({
        target: `${PACKAGE_ID}::object3d::insert_slot`,
        arguments: [
            txb.objectRef(objectRef),
            txb.pure.u32(slotId),
            txb.pure.string(slotType),
            txb.pure.u64(transformDenominator),
            txb.pure(transformRowMajor),
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

    return resp.objectChanges?.filter((oc) => {
        return oc.type === 'mutated' && oc.objectId === objectRef.objectId;
    }).at(0) as SuiObjectChangeMutated;
}

export async function cubeWithSlot() {

    const suiClient = new SuiClient({ url: SUI_NETWORK });
    const signer = Ed25519Keypair.fromSecretKey(fromB64(ADMIN_SECRET_KEY).slice(1));

    const cube = await mintObject({
        suiClient,
        signer,
        objectUri: `${CUBE}#Scene0`,
        transformDenominator: 0,
        transformRowMajor: [],
    });

    if (!cube) {
        console.log("Failed to mint cube");
        return;
    }
    // console.log("Minted cube");
    // console.log(cube);

    const updatedCube = await insertSlot({
        suiClient,
        signer,
        objectRef: cube!,
        slotId: 0,
        slotType: "surface",
        transformDenominator: 1,
        transformRowMajor: [
            1, 0, 0, 0,
            0, 1, 0, 1,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    });

    return updatedCube;
}

export async function cubeWith2Slots() {
    const suiClient = new SuiClient({ url: SUI_NETWORK });
    const signer = Ed25519Keypair.fromSecretKey(fromB64(ADMIN_SECRET_KEY).slice(1));

    const rect = await mintObject({
        suiClient,
        signer,
        objectUri: `${CUBE}#Scene0`,
        transformDenominator: 1,
        transformRowMajor: [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    });

    if (!rect) {
        console.log("Failed to mint cube");
        return;
    }
    // console.log("Minted cube");
    // console.log(cube);

    const updatedRect = await insertSlot({
        suiClient,
        signer,
        objectRef: rect!,
        slotId: 0,
        slotType: "surface",
        transformDenominator: 5,
        transformRowMajor: [
            5, 0, 0, 0,
            0, 5, 0, 5,
            0, 0, 5, 0,
            0, 0, 0, 5
        ]
    });
    if (!updatedRect) {
        console.log("Failed to insert slot");
        return;
    }

    const updatedRect2 = await insertSlot({
        suiClient,
        signer,
        objectRef: updatedRect,
        slotId: 1,
        slotType: "surface",
        transformDenominator: 5,
        transformRowMajor: [
            5, 0, 0, 3,
            0, 5, 0, 5,
            0, 0, 5, 0,
            0, 0, 0, 5
        ]
    });
    return updatedRect2;
}


// const RUN = true;
const RUN = false;
if (RUN) {
    cubeWithSlot().then(console.log);
}













