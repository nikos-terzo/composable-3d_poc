import { SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64 } from "@mysten/bcs";
import { ADMIN_SECRET_KEY, PACKAGE_ID, SUI_NETWORK } from "./config";
import { CUBE, DRAGON } from "./consts";

export async function mintObject(params: {
    suiClient: SuiClient;
    signer: Ed25519Keypair;
    objectUri: string;
    transformDenominator: number;
    transformRowMajor: number[];
}) {
    const {
        suiClient,
        signer,
        objectUri,
        transformDenominator,
        transformRowMajor,
    } = params;

    if (transformRowMajor.length !== 0 && transformDenominator !== 0) {
        if (transformRowMajor.length !== 16) {
            console.log(
                "Transform must be 16 elements long, or empty for unit-transform",
            );
            return;
        }
    }

    const txb = new TransactionBlock();

    const obj = txb.moveCall({
        target: `${PACKAGE_ID}::object3d::mint_object`,
        arguments: [
            txb.pure.string(objectUri),
            txb.pure.u64(transformDenominator),
            txb.pure(transformRowMajor),
        ],
    });

    txb.transferObjects([obj], signer.toSuiAddress());

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

    return txb_resp.effects?.created?.at(0)?.reference;
}

async function adminMintDragon() {
    return await mintObject({
        suiClient: new SuiClient({ url: SUI_NETWORK }),
        signer: Ed25519Keypair.fromSecretKey(fromB64(ADMIN_SECRET_KEY).slice(1)),
        objectUri: `${DRAGON}#Scene0`,
        transformDenominator: 0,
        transformRowMajor: [],
    });
}

async function adminMintCube() {
    return await mintObject({
        suiClient: new SuiClient({ url: SUI_NETWORK }),
        signer: Ed25519Keypair.fromSecretKey(fromB64(ADMIN_SECRET_KEY).slice(1)),
        objectUri: `${CUBE}#Scene0`,
        transformDenominator: 0,
        transformRowMajor: [],
    });
}

const RUN: string = "not";

switch (RUN) {
    case "dragon":
        adminMintDragon().then(console.log);
        break;
    case "cube":
        adminMintCube().then(console.log);
        break;
    default:
        ; // do nothing
}

