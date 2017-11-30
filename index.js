/**
 * Created by kule on 2017/11/22.
 */
const defaultsDeep = require('lodash/defaultsDeep');
const get = require('lodash/get');
const _ = require('lodash');
const isArray = require('lodash/isArray');
const last = require('lodash/last');
const castArray = require('lodash/castArray');

const path = require('path');
const _webpack = require('webpack');
const firstAttr = require('kule-util/lib/firstAttr').default;
const _cwd = process.cwd();

const ExtractText = require('extract-text-webpack-plugin');

const getFileDir = (entry = {}) => {
    let file = firstAttr(entry);
    if (isArray) {
        file = last(file);
    }
    return path.dirname(file || '');
};

const jsRule = ({
    env,
    babelExclude = () => {
        return false
    }
} = {}) => {
    const _env = defaultsDeep({}, env, {
        debug: true,
        useBuiltIns: true
    });
    return {
        test: /\.js(x|n)?$/i,
        loader: 'babel-loader',
        options: {
            presets: [
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
        exclude: [
            /\bnode_modules\b/i,
            ...castArray(babelExclude)
        ]
    };
};
const getResolve=({
    cwd=_cwd
}={})=>{
    return {
        alias:{
            'public':path.join(cwd,'./src/public'),
            'pages':path.join(cwd,'./src/pages'),
            'assets':path.join(cwd,'./src/assets'),
            '@':path.join(cwd,'./src/'),
        }
    }
};
const lessRuleUse = () => {
    return [
        {
            loader: "css-loader"
        }, {
            loader: 'postcss-loader',
            options: {
                plugins: [
                    require('autoprefixer')
                ]
            }
        }, {
            loader: "less-loader"
        }
    ];
};
const cssRuleUse = () => {
    return [
        {
            loader: "css-loader"
        }, {
            loader: 'postcss-loader',
            options: {
                plugins: [
                    require('autoprefixer')
                ]
            }
        }
    ];
};
const web = ({
    cwd = _cwd,
    env,
    babelExclude,
    ...config
}) => {
    const dir = getFileDir(get(config, 'entry'));
    return defaultsDeep({}, config, {
        entry: {},
        output: {
            path: path.join(cwd, dir),
            filename: '[name].bundle.js'
        },
        resolve:getResolve({
            cwd
        }),
        module: {
            rules: [
                jsRule({babelExclude,env}),
                {
                    test: /\.less$/,
                    use: [{
                        loader: "style-loader"
                    },
                        ...lessRuleUse()
                    ]
                },
                {
                    test:/\.css$/,
                    use:[
                        {
                            loader: "style-loader"
                        },
                        ...cssRuleUse()
                    ]
                }
            ]
        }
    });
};
const webRes = ({
    cwd=_cwd,
    env,
    babelExclude,
    ...config
} = {}) => {
    const _config = defaultsDeep({}, config, {
        output: {
            filename: 'js/[name].js'
        }
    });
    const extractLess = new ExtractText({
        filename: 'css/[name].css'
    });
    return defaultsDeep({}, _config, {}, {
        entry: {},
        output: {
            path: path.join(cwd, '/dist/'),
            publicPath:'/dist/',
            filename: 'js/[name].bundle.js'
        },
        resolve:getResolve({
            cwd
        }),
        module: {
            rules: [
                jsRule({
                    env,
                    babelExclude
                }),
                {
                    test: /\.less$/,
                    use: extractLess.extract({
                        use: lessRuleUse(),
                        fallback: 'style-loader'
                    }),
                },
                {
                    test:/\.css$/,
                    use: extractLess.extract({
                        use: cssRuleUse(),
                        fallback: 'style-loader'
                    })
                }
            ]
        },
        plugins: [
            extractLess
        ]
    });
};

const noop = () => {
};
const webpack = function (config, cb = noop) {
    return _webpack(config, function (err, out) {
        console.log(out.toString({
            colors: true
        }));
        cb(err, out);
    });
};

const express = require('express');
const devMiddleware = require('webpack-dev-middleware');
const devConfig = (config = {}) => {
    const _config = web(config);
    const publicPath = _.get(_config, 'output.publicPath');
    const rst = defaultsDeep({}, _config, {
        devServer: {
            contentBase: path.join(_cwd, '/'),
            publicPath,
            port: 9000
        }
    });
    return rst;
};
const webpackDev = (config = {}) => {
    const _config = devConfig(config);
    const port = _.get(_config, 'devServer.port');
    const contentBase = _.get(_config, 'devServer.contentBase');

    const app = express();
    app.use(devMiddleware(_webpack(_config), _config.devServer));
    app.use(express.static(contentBase));
    app.listen(port, () => {
        console.log('dev server running!')
    });
};

module.exports = {
    webRes,
    web,
    devConfig,
    webpackDev,
    webpack
};