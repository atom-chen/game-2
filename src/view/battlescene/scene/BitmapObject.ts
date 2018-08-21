/**
 * Created by sam on 2016/12/13.
 * 场景非动画物体
 */
import SceneObject from './SceneObject'

export default class BitmapObject extends SceneObject {

        private image:egret.Bitmap;

        public constructor(textrue:egret.Texture) {
        super();
        this.image = new egret.Bitmap();
                this.image.texture = textrue;
                this.image.y = -textrue.textureHeight;
        this.addChild(this.image);
    }

        /**
         * 注销本对象的资源。子类在必要时需要重写本方法。
         */
        public dispose(): void
        {
            super.dispose();
            this.removeChild(this.image);
            this.image.texture.dispose();
            this.image = null;
        }
}
