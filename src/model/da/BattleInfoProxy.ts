import ServerAccessProxy from "./ServerAccessProxy";
import ServerManager from "../net/NetManager";
import BattleInfo from "../vo/BattleInfo";
import Protocols from "../../enums/Protocols";
/**
 * Created by yaozhiguo on 2017/2/24.
 * 专司战斗信息的变更处理,如代码信息，实时战斗信息，以及学生状态信息等
 */

export default class BattleInfoProxy extends ServerAccessProxy
{
    public static USER_CODE_CHANGED:string = "userCodeChanged";

    protected parseReceivedData(rawData:any):void
    {
        super.parseReceivedData(rawData);

        if (Protocols.ROUTE_GET_STORY_CODE == rawData.route)
        {
            // console.log( event.data );
            let info:BattleInfo = this.data;
            let codeInfo:Object = rawData['data']['storycode'];
            info.codeId = codeInfo['id'];

            let codeResult:string = codeInfo['code'];
            if (codeResult.length > 0)
            {
                info.userCode = codeResult;
                ServerManager.getInstance().dispatchEvent(new egret.Event(BattleInfoProxy.USER_CODE_CHANGED, false, false, info));
            }
        }
        if (Protocols.ROUTE_SAVE_STORY_CODE == rawData.route)
        {
            console.log('save user code complete.');
        }
    }
}
