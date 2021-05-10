var Rstyle = Rstyle || (function(){let scriptStart = new Error;//Generates an error to localize the start of the script
    //converts the line number in the error to be line 1
    scriptStart = scriptStart.stack.match(/apiscript\.js:(\d+)/)[1]*1;
/*
    Page Navigator script:
    Author: Scott C.
    Contact: https://app.roll20.net/users/459831/scott-c
    Thanks to: The Aaron Arcane Scriptomancer and Stephen for their help with the bulk of this script.
    
    Script goal: to simplify moving between maps in Roll20.
    Ways to have true teleporting (token deleted at origin, and created at arrival)
    -delete all tokens that "represent" moved player's default characters probably best way.
    -token deletion can be toggled on/off
*/
    const version = 0.1;
    const lastUpdate = 1619216998;
    const scriptName = 'Rstyle';
    const forumLink = 'www.roll20.net';
    

    class RCSS {

        #CSSdeclarations;
        #defaultCSS;

        //initializes the new RCSS instance
        constructor(){
            this.#CSSdeclarations = [];
            this.#defaultCSS = _.clone(RCSS.baseStyles);
        }

        static baseStyles = {
            div:{
                overflow:`hidden`
            },
            table:{
                margin: '0',
                'border-collapse':'collapse',
                'font-size':'12px',
                border:'0px solid black',
                width:'auto'
            },
            p:{},
            h1:{},
            h2:{},
            h3:{},
            h4:{},
            h5:{},
            th:{},
            tr:{},
            td:{
                border:'0px solid black',
                'vertical-align':'middle'
            },
            pre:{},
            img:{},
            a:{},
            button:{
                'border': '0px solid black',
                'border-radius':'5px',
                'background-color': 'white',
                'margin': '0 .1em',
                'font-weight': 'bold',
                'padding': '0.1em .5em',
                'color': 'black',
                'box-shadow':'1px 1px 5px 1px gray,0px 0px 4px 0px black inset'
            },
            checkbox:{
                border:'1px solid black',
                'box-shadow':'0px 0px 4px 0px black inset',
                width:'10px',
                height:'10px',
                'background-color':'white',
                overflow:'visible',
                'border-radius':'1px',
                position:'relative',
                display:'table',
                padding:0,
                'border-collapse':'collapse',
                'line-height':'0'
            },
            sliderBackground:{
                'background-color':'black',
                'border-radius':'5px',
                display:'inline-block',
                'box-shadow':'1px 1px 5px 1px gray'
            },
            sliderThumbStyle:{
                display:'inline-block',
                margin:0,
                border:'0px solid black',
                'box-shadow':'0px 0px 4px 0px black inset',
                'border-radius':'5px'
            },
            toggleBackground:{
                'border-radius':'5px',
                border:'0px solid black',
                'box-shadow':'0px 0px 5px 0px black inset',
                width:'3em',
                height:'1em',
                display:'block',
                padding:'2px',
                overflow:'hidden'
            },
            toggleThumb:{
                'border-radius':'5px',
                'background-color':'white',
                'box-shadow':`0px 0px 2px 0px black,0px 0px 4px 0px black inset`,
                width:'50%',
                height:'100%',
                display:'block'
            }
        }

        //overwrite the default CSS for a given element
        //takes a string element name (e.g. table), and an object with property names as the keys and property values as the values
        setDefaultCSS = function(element,CSS){
            if(!CSS || !element || typeof CSS !== 'object' || Array.isArray(CSS))return;
            this.#defaultCSS[element] = CSS;
        }

        //Add CSS  to the defaultCSS for an element. The new CSS will overwrite any already existing properties, but will not edit other properties
        //takes a string element name (e.g. table), and an object with property names as the keys and property values as the values
        addToDefaultCSS = function(element,CSS){
            if(!CSS || !element || typeof CSS !== 'object' || Array.isArray(CSS)||!this.#defaultCSS[element])return;
            Object.keys(CSS).forEach((prop)=>{
                this.#defaultCSS[element][prop]=CSS[prop];
            })
        }

        //delete a property from the defaultCSS for an element
        //takes a string element name (e.g. table), and an array of property values to delete
        removeFromDefaultCSS = function(element,propArray){
            if(!propArray || !element || typeof propArray !== 'object' || !Array.isArray(propArray) || !this.#defaultCSS[element])return;
            propArray.forEach(p => delete this.#defaultCSS[element][p]);
        }

        //Resets the default for a given element to the base style
        //takes a string element name (e.g. table) or a boolean (true) element
        //if element===true, resets all styles, and deletes any added defaults
        resetDefaultCSS = function(element){
            if(!element || !this.#defaultCSS)return;
            if(element === true){
                Object.keys(this.#defaultCSS).forEach(this.resetDefaultCSS);
            }else if(RCSS.baseStyles[element]){
                this.#defaultCSS[element] = {};
                Object.keys(RCSS.baseStyles[element]).forEach((prop)=>{
                    this.#defaultCSS[element][prop]=RCSS.baseStyles[element][prop];
                });
            }else{
                delete this.#defaultCSS[element];
            }
        }

        //converts CSS color names to their hex color values
        static colorNameToHex = {
            aliceblue:'#f0f8ff',
            antiquewhite:'#faebd7',
            aqua:'#00ffff',
            aquamarine:'#7fffd4',
            azure:'#f0ffff',
            beige:'#f5f5dc',
            bisque:'#ffe4c4',
            black:'#000000',
            blanchedalmond:'#ffebcd',
            blue:'#0000ff',
            blueviolet:'#8a2be2',
            brown:'#a52a2a',
            burlywood:'#deb887',
            cadetblue:'#5f9ea0',
            chartreuse:'#7fff00',
            chocolate:'#d2691e',
            coral:'#ff7f50',
            cornflowerblue:'#6495ed',
            cornsilk:'#fff8dc',
            crimson:'#dc143c',
            cyan:'#00ffff',
            darkblue:'#00008b',
            darkcyan:'#008b8b',
            darkgoldenrod:'#b8860b',
            darkgray:'#a9a9a9',
            darkgreen:'#006400',
            darkgrey:'#a9a9a9',
            darkkhaki:'#bdb76b',
            darkmagenta:'#8b008b',
            darkolivegreen:'#556b2f',
            darkorange:'#ff8c00',
            darkorchid:'#9932cc',
            darkred:'#8b0000',
            darksalmon:'#e9967a',
            darkseagreen:'#8fbc8f',
            darkslateblue:'#483d8b',
            darkslategray:'#2f4f4f',
            darkslategrey:'#2f4f4f',
            darkturquoise:'#00ced1',
            darkviolet:'#9400d3',
            deeppink:'#ff1493',
            deepskyblue:'#00bfff',
            dimgray:'#696969',
            dimgrey:'#696969',
            dodgerblue:'#1e90ff',
            firebrick:'#b22222',
            floralwhite:'#fffaf0',
            forestgreen:'#228b22',
            fuchsia:'#ff00ff',
            gainsboro:'#dcdcdc',
            ghostwhite:'#f8f8ff',
            gold:'#ffd700',
            goldenrod:'#daa520',
            gray:'#808080',
            green:'#008000',
            greenyellow:'#adff2f',
            grey:'#808080',
            honeydew:'#f0fff0',
            hotpink:'#ff69b4',
            indianred:'#cd5c5c',
            indigo:'#4b0082',
            ivory:'#fffff0',
            khaki:'#f0e68c',
            lavender:'#e6e6fa',
            lavenderblush:'#fff0f5',
            lawngreen:'#7cfc00',
            lemonchiffon:'#fffacd',
            lightblue:'#add8e6',
            lightcoral:'#f08080',
            lightcyan:'#e0ffff',
            lightgoldenrodyellow:'#fafad2',
            lightgray:'#d3d3d3',
            lightgreen:'#90ee90',
            lightgrey:'#d3d3d3',
            lightpink:'#ffb6c1',
            lightsalmon:'#ffa07a',
            lightseagreen:'#20b2aa',
            lightskyblue:'#87cefa',
            lightslategray:'#778899',
            lightslategrey:'#778899',
            lightsteelblue:'#b0c4de',
            lightyellow:'#ffffe0',
            lime:'#00ff00',
            limegreen:'#32cd32',
            linen:'#faf0e6',
            magenta:'#ff00ff',
            maroon:'#800000',
            mediumaquamarine:'#66cdaa',
            mediumblue:'#0000cd',
            mediumorchid:'#ba55d3',
            mediumpurple:'#9370db',
            mediumseagreen:'#3cb371',
            mediumslateblue:'#7b68ee',
            mediumspringgreen:'#00fa9a',
            mediumturquoise:'#48d1cc',
            mediumvioletred:'#c71585',
            midnightblue:'#191970',
            mintcream:'#f5fffa',
            mistyrose:'#ffe4e1',
            moccasin:'#ffe4b5',
            navajowhite:'#ffdead',
            navy:'#000080',
            oldlace:'#fdf5e6',
            olive:'#808000',
            olivedrab:'#6b8e23',
            orange:'#ffa500',
            orangered:'#ff4500',
            orchid:'#da70d6',
            palegoldenrod:'#eee8aa',
            palegreen:'#98fb98',
            paleturquoise:'#afeeee',
            palevioletred:'#db7093',
            papayawhip:'#ffefd5',
            peachpuff:'#ffdab9',
            peru:'#cd853f',
            pink:'#ffc0cb',
            plum:'#dda0dd',
            powderblue:'#b0e0e6',
            purple:'#800080',
            red:'#ff0000',
            rosybrown:'#bc8f8f',
            royalblue:'#4169e1',
            saddlebrown:'#8b4513',
            salmon:'#fa8072',
            sandybrown:'#f4a460',
            seagreen:'#2e8b57',
            seashell:'#fff5ee',
            sienna:'#a0522d',
            silver:'#c0c0c0',
            skyblue:'#87ceeb',
            slateblue:'#6a5acd',
            slategray:'#708090',
            slategrey:'#708090',
            snow:'#fffafa',
            springgreen:'#00ff7f',
            steelblue:'#4682b4',
            tan:'#d2b48c',
            teal:'#008080',
            thistle:'#d8bfd8',
            tomato:'#ff6347',
            turquoise:'#40e0d0',
            violet:'#ee82ee',
            wheat:'#f5deb3',
            white:'#ffffff',
            whitesmoke:'#f5f5f5',
            yellow:'#ffff00',
            yellowgreen:'#9acd32'
        }

        static colorToHex = hex_input => {
            if(typeof hex_input !== 'string')return undefined;
            let hex = hex_input;
            if(/^\d{1,3},\d{1,3},\d{1,3}(?:,\d{1,3})?$/.test(hex_input)){
                hex = RCSS.rgbToHex(hex_input.split(',').reduce((m,c,i)=>{
                    let prop = ['r','g','b'][i];
                    if(prop){
                        m[prop] = c*1;
                    }
                    return m;
                },{}));
            };
            return RCSS.colorNameToHex[hex] || hex;
        }

        static componentToHex = num => {
            const hex = num.toString(num);
            return hex.length === 1 ? `0${hex}` : hex;
        }

        static rgbToHex = rgb => {
            return `#${Object.keys(rgb).map(c=>RCSS.componentToHex(c)).join('')}`;
        }

        //converts hexcolors to rgb
        static hexToRgb = hex_input => {
            // turn hex val to RGB
            let hex = RCSS.colorToHex(hex_input);
            if(!hex) return undefined;
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d]{2})?$/i.exec(hex)
            return result
                ? {
                      r: parseInt(result[1], 16),
                      g: parseInt(result[2], 16),
                      b: parseInt(result[3], 16)
                  }
                : {r:0,g:0,b:0};
        }
        
        //returns black or white depending on what will contrast best with a given color.
        //Takes a string representing the color in hex, rgb, or CSS color name
        setContrast = (color) => {
            let rgb = RCSS.hexToRgb(color);
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 125 ? '#000000' : '#ffffff'
        }

        static assembleCSS = (css) => {
            return `${_.keys(css).map((key)=>{return `${key}:${css[key]};`}).join('')}`
        }

        //expands the properties passed, merges them with defaults in the case of style property, and then returns them as a string to be inserted into an html element declaration
        _htmlProperties = function(element,properties){
            return Object.keys(properties).map((p)=>{
                if(p==='style'){
                    if(p==='background-color' && !properties.color){
                        properties.color = this.setContrast(properties[p]);
                    }
                    properties[p] = RCSS.assembleCSS({...this.#defaultCSS[element],...properties[p]});
                }
                return `${p}="${properties[p]}"`;
            }).join(' ')
        }

        //html elements
        div= (content,properties) => `<div ${this._htmlProperties('div',properties||{})}>${content}</div>`
        h1= (content,properties) => `<h1 ${this._htmlProperties('h1',properties||{})}>${content}</h1>`
        h2= (content,properties) => `<h2 ${this._htmlProperties('h2',properties||{})}>${content}</h2>`
        h3= (content,properties) => `<h3 ${this._htmlProperties('h3',properties||{})}>${content}</h3>`
        h4= (content,properties) => `<h4 ${this._htmlProperties('h4',properties||{})}>${content}</h4>`
        h5= (content,properties) => `<h5 ${this._htmlProperties('h5',properties||{})}>${content}</h5>`
        span= (content,properties) => `<span ${this._htmlProperties('span',properties||{})}>${content}</span>`
        p= (content,properties) => `<p ${this._htmlProperties('p',properties||{})}>${content}</p>`
        table= (content,properties) => `<table ${this._htmlProperties('table',properties||{})}><tbody style="width:100%,height:100%,">${content}</tbody></table>`
        th= (content,properties) => `<th ${this._htmlProperties('th',properties||{})}>${content}</th>`;
        tr= (content,properties) => `<tr ${this._htmlProperties('tr',properties||{})}>${content}</tr>`
        td= (content,properties) => `<td ${this._htmlProperties('td',properties||{})}>${content}</td>`
        pre= (content,properties) => `<pre ${this._htmlProperties('pre',properties||{})}>${content}</pre>`
        img= (properties) => `<img ${this._htmlProperties('img',properties||{})}>`;
        button= (content,properties) => `<a ${this._htmlProperties('button',properties||{})}>${content}</a>`
        a= (content,properties) => `<a ${this._htmlProperties('a',properties||{})}>${content}</a>`
        br= () => `<br>`

        //sets all current css properties to 'initial'. Note that this is not a valid value for some CSS properties
        static initializeCSS = (css)=> Object.keys(css).reduce((m,p)=>{
            m[p]='initial';
            return m;
        },{})

        //the following creation functions create a standardized text input (roll query with text entry or selections), selection (roll query with options), checkbox (toggleable button), or radio button(multi-state checkbox);
        //command is a text string containing the command string.
        //content is content that should be displayed in the button
        //title is the hover text for the input
        //current is the current value of the input
        //options contains the possible states of the input and what color to apply if that option is the current state
        //properties is an object that contains all properties to be added to the element including CSS style
        //Each function will return undefined if it is not passed the proper arguments

        //Takes a numerical or string content, a string command (or link), and a optional properties object
        input = (content,orig_properties={}) => {
            if((!content && content!==0) || (orig_properties && (typeof orig_properties !== 'object' || Array.isArray(orig_properties)))) return undefined;
            let properties = {style:{},...orig_properties}
            let but = this.button(content,properties);
            return but;
        }

        //Takes a style object, and an array of options of the format
        /*
            [
                current,//the current value
                {
                    title:'some title',
                    content:'what to display in the checkbox when this value is current',
                    style:'option specific styling',
                    command:'what command to send when clicked if this option is current',
                    value:'the value that this option activates on'
                },//option details
                {option details}//option details, in same format as first option
            ]
        */
        checkbox = (options_orig=[0,{},{}],style={}) => {
                let options = _.clone(options_orig);
                if((typeof options[0] !== 'number' && typeof options[0] !== 'string' && typeof options[0] !== 'boolean') || !RCSS.validateOptions('checkbox',options)){
                log(`--==>> RCSS Invalid Argument for toggle <<==--\n--==>> validateOptions: ${RCSS.validateOptions('checkbox',options)}`);
                    return undefined;
                }
                let current = options.shift();
                let option = options.find(o=>o.value === current)||{};
                return this.button(
                        this.table(
                            this.td((option.content||' '),{style:{'vertical-align':'middle'}})
                        ,{style:{...this.#defaultCSS.checkbox,...style,...option.style}})
                ,{style:{
                    'border': '0px solid black',
                    'border-radius':'0',
                    'background-color': 'transparent',
                    'margin': '0',
                    'font-weight': 'normal',
                    'padding': '0',
                    'color': 'black'
                },href:option.command,title:option.title});
        }

        //Takes an array of optionSets
        /*
            Option set format is:
            [
                [
                    currentvalue,//the current value of this option set
                    {
                        option 1 in the same format as individual options for a checkbox
                    },
                    {
                        option 2 in the same format as individual options for a checkbox
                    }
                ]
            ]
        */
        checkboxGroup = (optionSets=[[0,{},{}]]) =>{
            return optionSets.map(oSet => this.checkbox(oSet)).join('');
        }

        //const radio = (content,command,title,style={},current,options) => ;

        //creates an input where there are multiple possible values and each gets it's own button
        //Takes a backgroundstyle and thumbStyle object, and an array of options of the format
        /*
            [
                current,//the current value
                {
                    title:'some title',
                    active:'background color for the thumb when this option is active',
                    content:'what to display in the button',
                    thumbStyle:'option specific styling',
                    command:'what command to send when clicked',
                    value:'the value that this option activates on'
                },//option details
                {option details}//option details, in same format as first option
            ]
        */
        slider = (options_orig,backgroundCSS={},thumbStyle={}) => {
            let options = _.clone(options_orig)
            if((typeof options[0] !== 'number' && typeof options[0] !== 'string' && typeof options[0] !== 'boolean') || !RCSS.validateOptions('checkbox',options)){
                log(`--==>> RCSS Invalid Argument for toggle <<==--\n--==>> validateOptions: ${RCSS.validateOptions('checkbox',options)}`);
                return undefined;
            }
            let current = options.shift();
            let backCSS = {...this.#defaultCSS.sliderBackground,...(backgroundCSS||{})};
            return this.div(
                options.map((option)=>{
                    let backColor = current === option.value ? option.active : 'transparent';
                    let tStyle = {...this.#defaultCSS.sliderThumbStyle,...{'background-color':backColor},...thumbStyle};
                    if(!tStyle.color){
                        tStyle.color = this.setContrast(backColor === 'transparent' ? backCSS['background-color'] : backColor);
                    }
                    if(current === option.value && option.thumbStyle && typeof option.thumbStyle === 'object' && !Array.isArray(option.thumbStyle)){
                        tStyle = {...tStyle,...thumbStyle,...option.thumbStyle};
                    }
                    return this.button(option.content,{href:option.command,style:tStyle,title:option.title})
                }).join(' ')
            ,{style:backCSS,class:'slider-container'});
        }

        _toggleContent = (current,style) => this.div('',{style})

        //creates an input that has two states and is styled to look like a switch.
        //Takes a backgroundStyle and thumbStyle object, and an array of options of the format
        /*
            [
                current,//the current value
                {
                    title:'some title',
                    content:'what to display in the button',
                    backgroundStyle:'option specific background styling',
                    thumbStyle:'option specific thumb styling',
                    command:'what command to send when clicked if this option is current',
                    value:'the value that this option activates on'
                },//option details
                {option details}//option details, in same format as first option. Only accepts two options
            ]
        */
        toggle = (options,backgroundStyle={},thumbStyle={}) =>{
            if(!RCSS.validateOptions('checkbox',options)){
                log(`--==>> RCSS Invalid Argument for toggle <<==--\n--==>> validateOptions: ${RCSS.validateOptions('checkbox',options)}`);
                return undefined;
            }
            let [current,...opts] = options;
            let cIndex;
            let option = opts.find((o,i)=>{
                if(o.value === current){
                    cIndex = i;
                    return true;
                }
            })||{};
            let margins = [0,'50%'];
            let backStyle = {...this.#defaultCSS.toggleBackground,...backgroundStyle,'background-color':option.active||'black',...(option.backgroundStyle||{})};
            let tStyle = {...this.#defaultCSS.toggleThumb,...thumbStyle,'margin-left':margins[cIndex],...(option.thumbStyle||{})}
            return this.a(this._toggleContent(current,tStyle),{href:option.command,style:backStyle,title:option.title||''})
        }

        //Checks that the options for a checkbox, radio, slider, or toggle are of the correct format
        //takes a type string referencing what type of input is being checked, and the options object or array
        static validateOptions = function(type,options){
            if(type === 'checkbox'){
                return RCSS.validateCheckbox(options);
            }
        }

        static validateCheckbox = function(options){
            if(!Array.isArray(options)) return false;
            let [value,...opts] = options;
            if((typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean')){
                return false;
            }
            return opts.every(o => typeof o === 'object' && !Array.isArray(o) && ['value','command'].every(s => o[s] || o[s]===0 || o[s]===false));
        }

        static parseForChat = function(msg){
            return msg.replace(/\n\s*/g,'<br>');
        }
    };

    let html = new RCSS();
    //Error reporting function
    var sendError = function(err){
        var stackMatch = err.stack.match(/apiscript\.js:\d+/g);
        let stackToLog = `${err.stack}`.replace(/(apiscript\.js:)(\d+)/g,(match,label,line)=>{
            return `${label}${line-scriptStart+1}`;
        });
        log(`=> ${scriptName}} v${version} Error Logging<= `);
        log(stackToLog);
        log(`=> ${scriptName} Error Logging Completed<= `);
        _.each(stackMatch,(s)=>{
            let sMatch = s.match(/\d+/)[0]*1;
            err.stack = err.stack.replace(new RegExp('apiscript\.js:'+sMatch),'apiscript.js:'+(sMatch-scriptStart+ 1));
        });
        var stackToSend = err.stack ? (err.stack.match(/([^\n]+\n[^\n]+)/) ? err.stack.match(/([^\n]+\n[^\n]+)/)[1].replace(/\n/g,'<br>') : 'Unable to parse error') : 'Unable to parse error';
        let output = `/w gm ${html.div(`
            ${html.div(`
                ${scriptName} v${version} ${html.span('Error Handling'),{style:{'font-weight':'bold'}}}
            `,{style:{'font-weight':'bold','border-bottom':'1px solid black','font-size':'130%'}})}
            ${html.div(`
                The following error occured:${html.br()}
                ${html.pre(
                    html.div(`
                        ${html.span(`
                            ${err.message}${html.br()}
                            ${stackToSend}
                        `,{style:{'font-weight':'bold'}})}
                    `,{style:{}})
                )}
                Please post this error report to the ${html.a('Script forum thread',forumLink,{style:{'font-weight':'bold','font-style':'italic'}})}
            `,{style:{'border-top':'1px solid #000000','border-radius':'0.2em','background-color':'white'}})}
        `,{style:{border:'1px solid black','background-color':'white',padding:'3px'}})}`.replace(/\n\s*/g,'');
        sendChat(``,output,null,{noarchive:true});
    };

    const boot = function(){
        checkInstall();
    };

    const checkInstall = function() {
        try{
            log(`=> ${scriptName} v${version} <=-  [(${new Date(lastUpdate*1000)})]`);
            if( ! _.has(state,'Rstyle') || state.Rstyle.version !== version) {
                state.Rstyle = state.Rstyle || {};
                log(`==> Updating Rstyle to v${version} <`);
                state.Rstyle.version = version;
            }
        }catch(err){
            sendError(err);
        }
    };
    
    on("ready",function(){
        'use strict';
        boot();
    });

    return RCSS;
}());