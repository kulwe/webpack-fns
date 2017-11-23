/**
 * Created by kule on 2017/11/22.
 */
const defaultsDeep=require('lodash/defaultsDeep');
const get=require('lodash/get');
const path=require('path');
const webpack=require('webpack');
const firstAttr=require('kule-util/lib/firstAttr').default;
const _cwd=process.cwd();

const web=({
    cwd=_cwd,
    env,
    ...config
})=>{
    const _env = defaultsDeep({},env, {
        debug: true,
        useBuiltIns: true
    });
    const entry=get(config,'entry',{});
    const dir=path.dirname(firstAttr(entry)||'');
    return  defaultsDeep({},config,{
        entry:{
        },
        output:{
            path:path.join(cwd,dir),
            filename:'[name].bundle.js'
        },
        module:{
            rules:[
                {
                    test:/\.js(x|n)?$/i,
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
    web,
    webpack
};