import { ObjectOwner, SuiClient, SuiObjectChangeMutated, SuiObjectRef } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/bcs";
import { ADMIN_SECRET_KEY, PACKAGE_ID, SUI_NETWORK } from "./config";
import { CUBE, DRAGON, HELMET } from "./consts";
import { mintObject } from "./mint-object";
import { updateSourceFile } from "typescript";


async function insertAnchor(params: {
    suiClient: SuiClient;
    signer: Ed25519Keypair;
    objectRef: SuiObjectRef;
    anchorId: number,
    attachesTo: string,
    transformDenominator: number;
    transformRowMajor: number[];
}) {
    const {
        suiClient,
        signer,
        objectRef,
        anchorId: anchorId,
        attachesTo: attachesTo,
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
        target: `${PACKAGE_ID}::object3d::insert_anchor`,
        arguments: [
            txb.objectRef(objectRef),
            txb.pure.u32(anchorId),
            txb.pure.string(attachesTo),
            txb.pure.u64(transformDenominator),
            txb.pure(transformRowMajor),
        ],
    });

    const txb_resp = await suiClient.signAndExecuteTransactionBlock({
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

    if (txb_resp.errors) {
        console.error(JSON.stringify(txb_resp.errors));
        return;
    } else if (txb_resp.effects?.status.status != "success") {
        console.log("Failure executing transaction!");
        console.log(JSON.stringify(txb_resp));
        return;
    }

    return txb_resp;
}

export async function smallDragonWithAnchor() {

    const suiClient = new SuiClient({ url: SUI_NETWORK });
    const signer = Ed25519Keypair.fromSecretKey(fromB64(ADMIN_SECRET_KEY).slice(1));

    const dragon = await mintObject({
        suiClient,
        signer,
        objectUri: `${DRAGON}#Scene0`,
        transformDenominator: 10,
        transformRowMajor: [
            1, 0, 0, 0,
            0, 1, 0, 1,
            0, 0, 1, 0,
            0, 0, 0, 10
        ]
    });

    if (!dragon) {
        console.log("Failed to mint dragon");
        return;
    }
    // console.log("Minted dragon");
    // console.log(dragon);

    const resp = await insertAnchor({
        suiClient,
        signer,
        objectRef: dragon!,
        anchorId: 0,
        attachesTo: "surface",
        transformDenominator: 1,
        transformRowMajor: [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    });

    return resp?.objectChanges?.filter((objChange) => {
        return objChange.type === 'mutated' && objChange.objectType === `${PACKAGE_ID}::object3d::Object3D`;
    }).at(0) as {
        digest: string;
        objectId: string;
        objectType: string;
        owner: ObjectOwner;
        previousVersion: string;
        sender: string;
        type: 'mutated';
        version: string;
    };
}

export async function smallHelmetWithAnchor() {

    const suiClient = new SuiClient({ url: SUI_NETWORK });
    const signer = Ed25519Keypair.fromSecretKey(fromB64(ADMIN_SECRET_KEY).slice(1));

    const dragon = await mintObject({
        suiClient,
        signer,
        objectUri: `${HELMET}#Scene0`,
        transformDenominator: 1,
        transformRowMajor: [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    });

    if (!dragon) {
        console.log("Failed to mint helmet");
        return;
    }
    // console.log("Minted dragon");
    // console.log(dragon);

    const resp = await insertAnchor({
        suiClient,
        signer,
        objectRef: dragon!,
        anchorId: 0,
        attachesTo: "surface",
        transformDenominator: 1,
        transformRowMajor: [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    });

    return resp?.objectChanges?.filter((objChange) => {
        return objChange.type === 'mutated' && objChange.objectType === `${PACKAGE_ID}::object3d::Object3D`;
    }).at(0) as SuiObjectChangeMutated;
}

// const RUN = true;
const RUN = false;
if (RUN) {
    smallDragonWithAnchor().then(console.log);
}













