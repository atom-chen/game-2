/**
 * Created by yaozhiguo on 2016/12/2.
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */
export default class MathUtil
{
    public static DEG2RAD = Math.PI / 180;
    public static RAD2DEG = 180 / Math.PI;

    public static generateUUID():string
    {
        let chars:Array<any> = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
        let uuid:Array<string> = new Array( 36 );
        let rnd = 0, r;

        for ( var i:number = 0; i < 36; i++)
        {
            if ( i === 8 || i === 13 || i === 18 || i === 23 )
            {
                uuid[ i ] = '-';
            }
            else if ( i === 14 )
            {
                uuid[ i ] = '4';
            }
            else
            {
                if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];
            }
        }
        return uuid.join( '' );
    }

    public static clamp(value:number, min:number, max:number):number
    {
        return Math.max(min, Math.min(max, value));
    }

    // compute euclidian modulo of m % n
    // https://en.wikipedia.org/wiki/Modulo_operation
    public static euclideanModulo( n, m ) :number
    {
        return ( ( n % m ) + m ) % m;
    }

    // Linear mapping from range <a1, a2> to range <b1, b2>
    public static mapLinear( x, a1, a2, b1, b2 ):number
    {
        return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
    }

    // http://en.wikipedia.org/wiki/Smoothstep

    public static smoothstep ( x, min, max ):number
    {
        if ( x <= min ) return 0;
        if ( x >= max ) return 1;

        x = ( x - min ) / ( max - min );

        return x * x * ( 3 - 2 * x );
    }

    public static smootherstep( x, min, max ):number
    {
        if ( x <= min ) return 0;
        if ( x >= max ) return 1;

        x = ( x - min ) / ( max - min );

        return x * x * x * ( x * ( x * 6 - 15 ) + 10 );
    }

    public static random16():number
    {

        console.warn( 'THREE.Math.random16() has been deprecated. Use Math.random() instead.' );
        return Math.random();

    }

    // Random integer from <low, high> interval

    public static randInt( low, high ):number
    {
        return low + Math.floor( Math.random() * ( high - low + 1 ) );
    }

    // Random float from <low, high> interval
    public static randFloat( low, high ):number
    {
        return low + Math.random() * ( high - low );
    }

    // Random float from <-range/2, range/2> interval
    public static randFloatSpread( range ):number
    {
        return range * ( 0.5 - Math.random() );
    }

    public static degToRad( degrees:number ) :number
    {
        return degrees * MathUtil.DEG2RAD;
    }

    public static radToDeg ( radians:number ):number
    {
        return radians * MathUtil.RAD2DEG;
    }

    public static isPowerOfTwo ( value:number ):boolean
    {
        return ( value & ( value - 1 ) ) === 0 && value !== 0;
    }

    public static nearestPowerOfTwo ( value:number ):number
    {
        return Math.pow( 2, Math.round( Math.log( value ) / Math.LN2 ) );
    }

    public static nextPowerOfTwo ( value:number ):number
    {
        value --;
        value |= value >> 1;
        value |= value >> 2;
        value |= value >> 4;
        value |= value >> 8;
        value |= value >> 16;
        value ++;

        return value;
    }
}