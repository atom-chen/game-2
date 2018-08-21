/**
 * @author rappel
 * @time 2016-12-13 10:25
 */
export default class BarrierBtn extends egret.Sprite {
	public static STATE_OPEN  = 2; //已完成的关卡
    public static STATE_STRIP = 1; //正执行的关卡
    public static STATE_LOCK  = 0; //未完成的关卡

	//数据
	private type:number;
	private barrierName: number;
	private options: any;

	//视图
	public barrierShow: any;        //圈圈+箭头
	public barrierLabel: eui.Label; //关卡的序号
    public starShow: eui.Image;     //星星展示
	public starLabel: eui.Label;    //星星个数/星星总数
    public knowledgeFrame: eui.Image;    //知识点框
    public knowledgeLabel: eui.Label;//知识点   

	public constructor( type = BarrierBtn.STATE_OPEN, barrierName:number, options:any ) {
		super();

		this.type = type;
		this.barrierName = barrierName;
		this.options     = options || {
            "topic": "基础语法",
            "nowStarCount": 0,
            "totalStarCount": 0
        };
        this.touchChildren = false;
        this.touchEnabled  = true;

		//正在进行的关卡
		if( BarrierBtn.STATE_STRIP == this.type ) {
			var mcDataFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(RES.getRes('tollgateBtn_json'),RES.getRes('tollgateBtn_png'));
            this.barrierShow = new egret.MovieClip( mcDataFactory.generateMovieClipData("tollgate") );
            this.barrierShow.x = -3;
            this.barrierShow.y = -87;
            this.barrierShow.gotoAndPlay( 1, -1 );
            this.barrierShow.touchEnabled = true;
		}
		else {//未完成的关卡或已完成的关卡
			this.barrierShow = new egret.Bitmap();
		}
		this.addChild( this.barrierShow );

		this.barrierLabel = new eui.Label;
        this.barrierLabel.text = ( this.barrierName && this.barrierName.toString() ) || "9";
        this.barrierLabel.fontFamily = 'Microsoft YaHei';
        this.barrierLabel.bold = true;
        this.barrierLabel.textColor = 0xffffff;
        this.barrierLabel.x = 34;
        this.barrierLabel.y = 18;
        if( this.barrierName && this.barrierName.toString().length >= 2) {
            this.barrierLabel.x = 25;
        }
        if( BarrierBtn.STATE_STRIP == this.type ){
            this.barrierLabel.y = 25;
            if( this.barrierName && this.barrierName.toString().length >= 2) {
                this.barrierLabel.x = 25;
            }
            else
            {
                this.barrierLabel.x = 39;
            }
        } 
        this.addChild( this.barrierLabel );

		if( BarrierBtn.STATE_OPEN == this.type ) {
			RES.getResAsync('explore_json.tanxian7_png', this.completed, this);
		}
		else if( BarrierBtn.STATE_LOCK == this.type ) {
            RES.getResAsync('explore_json.tanxian7_png', (data)=>{

                this.barrierShow.bitmapData = data;
                this.barrierLabel.text = '';
                RES.getResAsync('explore_json.tollgate_lock_png', (data)=>{
                    var bmp:egret.Bitmap = new egret.Bitmap();
                    bmp.bitmapData = data;
                    this.addChild(bmp);
                    bmp.x = 28;
                    bmp.y = 15;   
                }, this);

            }, this);
		}

        this.knowledgeFrame = new eui.Image();
        this.knowledgeFrame.texture = RES.getRes('explore_json.tanxian_frame_png');
        this.knowledgeFrame.x = -49;
        this.knowledgeFrame.y = 57;
        this.addChild( this.knowledgeFrame );

        this.knowledgeLabel = new eui.Label();
        this.knowledgeLabel.text = this.options['topic'];
        this.knowledgeLabel.x = -36;
        this.knowledgeLabel.y = 70;
        this.knowledgeLabel.width = 170;
        this.knowledgeLabel.size = 18;
        this.knowledgeLabel.textAlign = egret.HorizontalAlign.CENTER;
        this.knowledgeLabel.textColor = 0xffffff;
        this.knowledgeLabel.strokeColor = 0x003479;
        this.knowledgeLabel.stroke = 3;
        this.addChild( this.knowledgeLabel );

        if( BarrierBtn.STATE_STRIP == this.type || BarrierBtn.STATE_OPEN == this.type ) {
            this.starShow = new eui.Image();
            this.starShow.texture = RES.getRes('explore_json.tanxian_star_png');
            this.starShow.x = -75;
            this.starShow.y = 31;
            this.addChild( this.starShow );

            this.starLabel = new eui.Label();
            this.starLabel.text = this.options['nowStarCount'] + "/" + this.options['totalStarCount'];
            this.starLabel.x = -70;
            this.starLabel.y = 83;
            this.starLabel.width = 50;
            this.starLabel.textAlign = egret.HorizontalAlign.CENTER;
            this.starLabel.size = 16;
            this.starLabel.textColor = 0xfffe9c;
            this.starLabel.stroke = 3;
            this.starLabel.strokeColor = 0x4c2f26;
            this.addChild( this.starLabel );
        }
	}

   private completed(data):void {
        this.barrierShow.bitmapData = data;      
   }
}