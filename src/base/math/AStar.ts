import WorldClock = dragonBones.WorldClock;
import SceneObject from "../../view/battlescene/scene/SceneObject";
/**
 * Created by sam on 2016/11/21.
 * A* 寻路
 */

export default class AStar {
    private static _instance: AStar;
    static getInstance(): AStar
    {
        if(this._instance == null)
        {
            this._instance = new AStar();
        }
        return this._instance;
    }

    private inList(list, current):boolean {
        for (var i = 0, len = list.length; i < len; i++) {
            if (current.y == list[i].y && current.x == list[i].x)
                return true;
        }
        return false;
    }

    private getRounds(points, current):any[] {
        var rounds = [];
        if (current.y - 1 >= 0 && points[current.x][current.y - 1]==0) rounds.push(new egret.Point(current.x,current.y-1));
        if (current.x - 1 >= 0 && points[current.x - 1][current.y]==0) rounds.push(new egret.Point(current.x-1,current.y));
        if (current.y + 1 < points[1].length && points[current.x][current.y + 1]==0) rounds.push(new egret.Point(current.x,current.y+1));
        if (current.x + 1 < points.length && points[current.x + 1][current.y]==0) rounds.push(new egret.Point(current.x+1,current.y));
        if (current.y + 1 < points[1].length && current.x + 1 < points.length && points[current.x + 1][current.y+1]==0) rounds.push(new egret.Point(current.x+1,current.y+1));
        if (current.y - 1 >= 0 && current.x + 1 < points.length && points[current.x + 1][current.y-1]==0) rounds.push(new egret.Point(current.x+1,current.y-1));
        if (current.y + 1 < points[1].length && current.x - 1 >= 0 && points[current.x - 1][current.y+1]==0) rounds.push(new egret.Point(current.x-1,current.y+1));
        if (current.y - 1 >= 0 && current.x - 1 >= 0 && points[current.x - 1][current.y-1]==0) rounds.push(new egret.Point(current.x-1,current.y-1));
        return rounds;
    }

    public findPath(person:SceneObject,start:any,endPos:any):any[]
    {
        let end:any = endPos;
        if(person.gameWorld==null) return [];
        if(person.gameWorld.checkTilePassable(person,new egret.Point(endPos.x,endPos.y))==false){
            let targetPoints:any[] = [];
            for (var i = 1; i<30 ; i++) {
                for(var j=0;j<i*2;j++){
                    let x = endPos.x - i + j;
                    let y = endPos.y - i;
                    if(person.gameWorld.checkTilePassable(person,new egret.Point(x,y))){
                        targetPoints.push(new egret.Point(x,y));
                        break;
                    }
                }
                for(var j=0;j<i*2;j++){
                    let x = endPos.x + i;
                    let y = endPos.y - i + j;
                    if(person.gameWorld.checkTilePassable(person,new egret.Point(x,y))){
                        targetPoints.push(new egret.Point(x,y));
                        break;
                    }
                }
                for(var j=0;j<i*2;j++){
                    let x = endPos.x + i - j;
                    let y = endPos.y + i;
                    if(person.gameWorld.checkTilePassable(person,new egret.Point(x,y))){
                        targetPoints.push(new egret.Point(x,y));
                        break;
                    }
                }
                for(var j=0;j<i*2;j++){
                    let x = endPos.x - i;
                    let y = endPos.y + i - j;
                    if(person.gameWorld.checkTilePassable(person,new egret.Point(x,y))){
                        targetPoints.push(new egret.Point(x,y));
                        break;
                    }
                }
                if(targetPoints.length>0) {
                    var targetPoint:egret.Point;
                    var _distance = -1;
                    for(var j=0;j<targetPoints.length;j++){
                        if(egret.Point.distance(start,targetPoints[j])<_distance||_distance==-1)
                        {
                            targetPoint = targetPoints[j];
                        }
                    }
                    end = targetPoint;
                    break;
                }
            }
        }
        var opens = [];     // 存放可检索的方块(开启列表)
        var closes = [];    // 存放已检索的方块（关闭列表）
        var cur = null;    // 当前指针
        var bFind = true;  // 是否检索
        start.F = 0;
        start.G = 0;
        start.H = 0;
        closes.push(start);
        cur = start;
        if (Math.abs(start.x - end.x) + Math.abs(start.y - end.y) == 1) { // 如果起始点紧邻结束点则不计算路径直接将起始点和结束点压入closes数组
            end.P = start;
            closes.push(end);
            bFind = false;
        }
        while (cur && bFind) {
            if (!this.inList(closes, cur))
                closes.push(cur);
            var rounds = this.getRounds(person.gameWorld.grids, cur);
            for (var i = 0; i < rounds.length; i++) {
                if (person.gameWorld.checkTilePassable(person,new egret.Point(rounds[i].x,rounds[i].y)) == false || this.inList(closes, rounds[i]) || this.inList(opens, rounds[i]))
                    continue;
                else if (!this.inList(opens, rounds[i]) && person.gameWorld.checkTilePassable(person,new egret.Point(rounds[i].x,rounds[i].y))) {
                    rounds[i].G = cur.G + Math.sqrt((rounds[i].x - end.x)*(rounds[i].x - end.x) + (rounds[i].y - end.y)*(rounds[i].y - end.y));                        //不算斜的，只算横竖，设每格距离为1
                    rounds[i].H = Math.sqrt((rounds[i].x - end.x)*(rounds[i].x - end.x) + (rounds[i].y - end.y)*(rounds[i].y - end.y));
                    rounds[i].F = rounds[i].G + rounds[i].H;
                    rounds[i].P = cur;                              //cur为.P的父指针
                    opens.push(rounds[i]);
                }
            }
            if (!opens.length) {
                cur = null;
                opens = [];
                break;
            }
            opens.sort(function (a, b) {
                return a.F - b.F;
            });
            var oMinF = opens[0];
            var aMinF = [];                                         // 存放opens数组中F值最小的元素集合
            for (var i = 0; i < opens.length; i++) {
                if (opens[i].F == oMinF.F)
                    aMinF.push(opens[i]);
            }
            if (aMinF.length > 1) {
                for (var i = 0; i < aMinF.length; i++) {
                    aMinF[i].D = Math.abs(aMinF[i].x - cur.x) + Math.abs(aMinF[i].y - cur.y);
                }
                aMinF.sort(function (a, b) {
                    return a.D - b.D;
                });
                oMinF = aMinF[0];
            }
            cur = oMinF;
            if (!this.inList(closes, cur)) closes.push(cur);
            for (var i = 0; i < opens.length; i++) {
                if (opens[i] == cur) {
                    opens.splice(i, 1);                             //将第i个值删除
                    break;
                }
            }
            if (cur.H == 1) {
                end.P = cur;
                closes.push(end);
                cur = null;
            }
        }
        if (closes.length) {
            var dotCur = closes[closes.length - 1];
            var path = [];                                                  // 存放最终路径
            var i = 0;
            while (dotCur) {
                path.unshift(new egret.Point(dotCur.x,dotCur.y));           // 将当前点压入path数组的头部// 设置当前点指向父级
                dotCur = dotCur.P;
                if (dotCur!=null&&!dotCur.P) {
                    dotCur = null;
                }
            }
            opens = null;
            closes = null;
            return path;
        }
        else return null;
    }
}

