/**
 * Created by yaozh on 2017/4/5.
 */
declare module TDGA{
    function onPageLeave();
    /**
     * //注册、登录、切换帐户、唤醒游戏时传入玩家账户信息
     TDGA.Account({
        accountId : '1234256',
        level : 12,
        gameServer : '北京1',
        accountType : 1,
        age : 24,
        accountName : '昵称',
        gender : 1
        });
     */
    function Account(param?:any);

    //赠予虚拟币，
    /**
     * @params virtualCurrencyAmount 虚拟币金额。
     * @params reason 赠送虚拟币原因/类型。格式：32个字符内的中文、空格、英文、数字。不要带有任何开发中的转义字符，如斜杠。注意：最多支持100种不同原因。
     */
    function onReward(virtualCurrencyAmount:number, reason:string);

    /**
     * 记录付费点
     * {
            item :'消费点的编号',
            itemNumber : 120,
            priceInVirtualCurrency : 20
        }
     */
    function onItemPurchase(params:any);

    /**
     * 消耗物品或服务等
     * {
            item : '消费点的编号',
            itemNumber : 20
        }
     */
    function onItemUse(params:any);


    function onMissionBegin(missionId:string);//接受或进入
    //完成
    function onMissionCompleted(missionId:string);
    /**
     * 失败
     *  onMissionFailed(‘温泉之阵’,’战斗失败’);
     * @params missionId 任务、关卡或副本的编号，最多32个字符。
     * @params cause 失败原因，最多16个字符。共支持100种原因，此处可填写ID，别名可在报表页面中编辑。
     */
    function onMissionFailed(missionId:string, cause:string);


    export module Account{
        function setAccountName(name:string);
        function setAccountType(type:number);//传入帐户的类型，不同数字对应不同的类型： 0，匿名账户；
        function setLevel(level:number);
        function setGender(gender:number); //1，男；2，女；
        function setAge(age:number);
        function setGameServer(serverName:string);
    }
}
