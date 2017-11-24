/**
 * Created by kule on 2017/11/22.
 */
const defaultsDeep=require('lodash/defaultsDeep');
const get=require('lodash/get');
const isArray=require('lodash/isArray');
const last=require('lodash/last');
const castArray=require('lodash/castArray');

const path=require('path');
const webpack=require('webpack');
const firstAttr=require('kule-util/lib/firstAttr').default;
const _cwd=process.cwd();

const getFileDir=(entry={})=>{
    let file=firstAttr(entry);
    if(isArray){
        file=last(file);
    }
    return path.dirname(file||'');
};
const web=({
    cwd=_cwd,
    env,
    babelExclude=()=>{return false},
    ...config
})=>{
    const _env = defaultsDeep({},env, {
        debug: true,
        useBuiltIns: true
    });
    const dir=getFileDir(get(config,'entry'));
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
                                    // "helpers": false,
                                    "polyfill": false,
                                    // "regenerator": false
                                }
                            ],
                            /*            [
                                            require('babel-plugin-external-helpers'),
                                        ]*/
                        ],
                        comments: false
                    },
                    exclude:[
                        /\bnode_modules\b/i,
                        ...castArray(babelExclude)
                    ]
                }
            ]
        }
    });
};

module.exports={
    web,
    webpack
};