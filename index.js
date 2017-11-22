/**
 * Created by kule on 2017/11/22.
 */
const defaultsDeep=require('lodash/defaultsDeep');
const path=require('path');
const
const web=({
    env,
    ...config
})=>{
    const _env = defaultsDeep({},env, {
        debug: true,
        useBuiltIns: true
    });
    return  defaultsDeep({},config,{
        entry:{
        },
        output:{
            path:path.resolve(__dirname),
            filename:'[name].bundle.js'
        },
        module:{
            rules:[
                {
                    test:'\.js(x|n)?$',
                    loader:'babel-loader',
                    options:{
                        presets:[
                            [
                                require('babel-preset-env'),
                                _env
                            ],
                            require('babel-preset-react'),
                            require('babel-preset-stage-0')
                        ],
                        plugins: [
                            [
                                require('babel-plugin-transform-runtime'),
                                {
                                    "helpers": true,
                                    "polyfill": false,
                                    "regenerator": true
                                }
                            ],
                            /*            [
                                            require('babel-plugin-external-helpers'),
                                        ]*/
                        ],
                        comments: false
                    }
                }
            ]
        }
    });
};

module.exports={
    web
};