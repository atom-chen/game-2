import Globals from "../../enums/Globals";
/**
 * Created by sam on 2017/1/4.
 *
 */

export default class PointUtil {
    private static _instance: PointUtil;
    static getInstance(): PointUtil
    {
        if(this._instance == null)
        {
            this._instance = new PointUtil();
        }
        return this._instance;
    }

    public logicToPosition(pt:egret.Point):egret.Point
    {
        return new egret.Point(pt.x*Globals.TILE_WIDTH+Globals.TILE_WIDTH/2,pt.y*Globals.TILE_HEIGHT+Globals.TILE_HEIGHT/2);
    }

    public positionToLogic(pos:egret.Point):egret.Point
    {
        return new egret.Point(Math.floor((pos.x-Globals.TILE_WIDTH/2) / Globals.TILE_WIDTH), Math.floor((pos.y-Globals.TILE_HEIGHT/2) / Globals.TILE_HEIGHT));
    }

    private isCollsionWithRect(rect1:egret.Rectangle,rect2:egret.Rectangle):boolean
    {
        if (rect1.x > rect2.x + rect2.width) {
            return false;
        } else if (rect1.x + rect1.width < rect2.x) {
            return false;
        } else if (rect1.y > rect2.y + rect2.height) {
            return false;
        } else if (rect1.y + rect1.height < rect2.y) {
            return false;
        }
        return true;
    }

    public checkCollision(from:egret.Point,to:egret.Point,box:egret.Rectangle):boolean
    {
        var rect = new egret.Rectangle(Math.min(from.x,to.x),Math.min(from.y,to.y),Math.abs(from.x-to.x),Math.abs(from.y-to.y));
        if(this.isCollsionWithRect(rect,box))
        {
            var dy = Math.floor(box.width*rect.height/rect.width);
            if(from.x-to.x<0)
            {
                if (from.y - to.y < 0) {
                    var collisionY = rect.y + rect.height * (rect.width - box.x + rect.x) / rect.width;
                    if (collisionY >= box.y && collisionY <= box.y + box.height + dy) return true;
                    else return false;
                } else if (from.y - to.y > 0) {
                    var collisionY = rect.y + rect.height - rect.height * (box.x - rect.x) / rect.width;
                    if (collisionY >= box.y - dy && collisionY <= box.y + box.height) return true;
                    else return false;
                }else if(box.x<=rect.x && box.x+box.width>rect.x) return true;
            }else if (from.x - to.x > 0) {
                if (to.y - from.y < 0) {
                    var collisionY = rect.y + rect.height - rect.height * (rect.width - box.x + rect.x) / rect.width;
                    if (collisionY >= box.y - dy && collisionY <= box.y + box.height) return true;
                    else return false;
                } else if (to.y - from.y > 0){
                    var collisionY = rect.y + rect.height * (box.x - rect.x) / rect.width;
                    if (collisionY >= box.y && collisionY <= box.y + box.height + dy) return true;
                    else return false;
                }else if(box.x<=rect.x+rect.width && box.x>rect.x) return true;
            }else{
                if(box.x<=rect.x && box.x+box.width>rect.x && box.y>=rect.y && box.y<rect.y+rect.height) return true;
            }
        }
        return false;
    }
}

