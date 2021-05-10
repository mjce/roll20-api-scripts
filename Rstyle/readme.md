
# Rstyle Development Readme
Rstyle is a class/library that is designed to make creating GUI's and in game documentation for API scripts easier. Whether it's a handout based GUI or a chat menu, Rstyle can simplify the coding of it.
## Using Rstyle
In your script, create a new instance of the Rstyle class:
```js
let html = new Rstyle();
```
This will create a new instance of Rstyle just for your script to use. In later versions you will be able to modify default CSS and even create CSS templates to be used across scripts, but that's for later. Most functions of the Rstyle class are not static. This means that you invoke them on the instance of Rstyle that you created, e.g. `html.div()` would create a `<div></div>`. A few functions are static and are invoked on the class itself, eg. `Rstyle.setContrast()`. These two types of functions will be split up in this documentation.
## Basic HTML entities (plus some)
### Content & properties
The content and properties arguments are the arguments used with the basic HTML entities. 
- Content
Content is placed in between the opening and closing tags, e.g. `<div>Contents</div>`. Content can be any string or number, including the results of another Rstyle html entity.
- Properties (optional argument)
Properties is an object containing the details for any properties you want to add to the object, whether it's the image source for `<img>` or inline css via `style`. The properties object is parsed and added to the opening tag, e.g. `{style:{border:"1px solid black"}}` becomes `<div style="border:1px solid black;"></div>` when used on a div.
### Creating basic HTML entities 
Rstyle allows for functional insertion of many basic html elements, along with a few preset modifiers. These are listed below along with what arguments they accept, and what they're default styling is (if any is specified by Rstyle).
- div(content,properties)
Your basic html `<div>` tag.
```css
{
    overflow:hidden;
}
```
- h1-5(content,properties)
Your basic headers. Rstyle currently only supports 5 levels of headers
- span(content,properties)
- p(content,properties)
- table(content,properties)
```css
{
    margin: 0;
    border-collapse:collapse;
    font-size:12px;
    border:0px solid black;
    width:auto;
}
```
- th(content,properties)
- tr(content,properties)
- td(content,properties)
```css
{
    border:0px solid black;
    vertical-align:middle;
}
```
- pre(content,properties)
- img(properties)
An `<img>` tag. Note that properties is required here, and it must be at least `{src:"someurl.com"}`.
- a(content,properties)
Your basic anchor tag. Note that `href` is put into `properties`. Useful for web links. Note that for command buttons, the `button()` method described below is recommended for styling reasons.
- button(content,properties)
Note that this is **NOT** the `<button>` html element. This is another way to create an anchor tag as above, but it uses different default CSS that creates nicer looking chat buttons than the big pink Roll20 default for command buttons.
```css
{
    border: 0px solid black;
    border-radius:5px;
    background-color: white;
    margin: 0 .1em;
    font-weight: bold;
    padding: 0.1em .5em;
    color: black;
    box-shadow:1px 1px 5px 1px gray,0px 0px 4px 0px black inset;
}
```
- input(content,properties)
An alias for `button()`.
- br()
Creates a `<br>` tag. Does not accept any modifications.
## Complex inputs
These complex elements take additional arguments and allow for more complex inputs to be created. These are useful for making nice looking GUI's to modify how a script functions.
### Arguments
#### options
The first argument for each complex element is an array of information about the current and possible states of that input. The basic format for this array is:
```js
[
    current,//the current value. A string, number, or boolean.
    {
        title:'some title',
        style:{CSS},//used only for checkboxes
        thumbStyle:{CSS},//Used only for sliders and toggles
        active:'color',//Used only for sliders and toggles
        backgroundStyle:{CSS},//Used only for toggles
        command:'what command to send when clicked',
        value:'the value that this option activates on'
    },//option details
    {option details}//option details, in same format as first option
]
```
Some complex inputs will have additional required or optional keys for the `option details` or additional optional arguments, but the above details are shared among all of the complex inputs.
### Creating complex inputs
#### checkbox(options)
The checkbox replicates the basic styling of an `<input type="checkbox">`. The default CSS for a checkbox is:
```css
border:1px solid black;
box-shadow:0px 0px 4px 0px black inset;
font-style:pictos;
width:10px;
height:10px;
background-color:white;
overflow:visible;
border-radius:1px;
position:relative;
display:table;
padding:0;
border-collapse:collapse;
line-height:0;
```
Note that currently, the checkbox does not work if forced to change its size, and if creating a chat menu, it is recommended that you avoid Roll20 chat format characters (e.g. `*`), and only use a single character from the [Pictos fonts](https://wiki.roll20.net/CSS_Wizardry#Pictos) (or other symbol fonts on that wiki page). 
#### checkboxgroup(optionSets)

This is a group of checkboxes that will be placed inline with each other. It takes an array of the option arrays that would be used for a checkbox.
#### slider(options,backgroundCSS,thumbCSS)

A slider functions similarly to an `<input type="radio">` set, but is contained in along a single track that the selection "thumb" moves along. A slider has two default CSSs, one for the background and one for the thumb:

**Background CSS**
```css
background-color:black;
border-radius:5px;
display:inline-block;
box-shadow:1px 1px 5px 1px gray;
```
**Thumb CSS**
```css
display:inline-block;
margin:0;
border:0px solid black;
box-shadow:0px 0px 4px 0px black inset;
border-radius:5px;
```
A slider also has additional arguments and option keys that can be passed to it.
The additional arguments are `backgroundCSS` and `thumbCSS`. These are objects with the same format as the style key of the properties object for basic HTML entities, and will adjust the default styling of the slider's background and thumb respectively, overriding the default CSS for the slider.
The additional option keys are `thumbStyle` and `active`. `thumbStyle` functions just like the `thumbCSS`, but only applies when the option that it belongs to is active. `active` is a shorthand property to adjust the background color of the thumb based on the active option. `active` can be a hex color or [CSS/HTML color name](https://www.w3schools.com/colors/colors_names.asp).
#### toggle(options,backgroundCSS,ThumbCSS)
Takes the same arguments as a slider, but makes a toggle. This looks like a switch. The default CSS for a toggle is:
**Thumb**
```css
border-radius:5px;
background-color:white;
box-shadow:0px 0px 2px 0px black,0px 0px 4px 0px black inset;
width:50%;
height:100%;
display:block;
```
**Background**
```css
border-radius:5px;
border:0px solid black;
box-shadow:0px 0px 5px 0px black inset;
width:3em;
height:1em;
display:block;
padding:2px;
overflow:hidden;
```
In addition to the keys that can be passed in the option objects for a slider, toggles can also take a `backgroundStyle` key that will control the CSS of the toggle's background when that option is active.
## Utility Methods
#### setContrast(color)
Returns the color (white or black - *in the future this will be customizable*) that will contrast with the provided color the best. The color argument can be a hex color, rgb color string (`200,100,0`), or a [CSS/HTML color name](https://www.w3schools.com/colors/colors_names.asp). If the color is not valid, it will return `#ffffff`
#### Rstyle.hexToRgb(color)
Converts the provided color to an rgb color object(`{r:200,g:100,b:0}`). The color argument can be a hex color, rgb color string (`200,100,0`), or a [CSS/HTML color name](https://www.w3schools.com/colors/colors_names.asp). If the color is not valid returns `{r:0,g:0,b:0}`. This is a static method, and so must be invoked on the Rstyle class itself, rather than the instance created in a given script.
#### Rstyle.colorToHex(color)
Converts the provided color to a hex color string (e.g. `#ffffff`). The color argument can be a hex color, rgb color object , or a [CSS/HTML color name](https://www.w3schools.com/colors/colors_names.asp). This is a static method, and so must be invoked on the Rstyle class itself, rather than the instance created in a given script.
#### Rstyle.initializeCSS(css)
Sets the values of all the keys of the provided object to `initial`. This is a static method, and so must be invoked on the Rstyle class itself, rather than the instance created in a given script.
#### Rstyle.parseForChat(msg)
Replaces `\n` with `<br>` so that html formatted text in a message will not spill out of elements.
## Example script
Let's make a (very) simple demo script to send a hello message when the game boots up. First, to do this without Rstyle:
```js
on('ready',()=>{
	let message = `<div style="border:2px solid blue;box-shadow:0 0 10px 2px gray;background-color:white;"><h1 style="color:darkred;font-style:italic;">Discovery One</h1><span>Hello Dave</span></div>`
	sendChat('Hal 9000',message);
});
```
Seems, pretty simple, but it's pretty hard for us lowly colloidals. We can clean it up a bit by adding new lines and indentation to denote nesting of elements, but then we need to remove all those `\n`s or the roll20 chat parser will destroy our nicely formatted output, and raw HTML still isn't the greatest for human readability.

So, with Rstyle installed:
```js
on('ready',()=>{
	const html = new Rstyle();
	let message = html.div(//Formatted container for our message
		`${html.h1('Discovery One',{color:'darkred','font-style':'italic'})}
		${html.span('Hello Dave'}
		`
	,{style:{border:'2px solid blue','box-shadow':'0 0 10px 2px gray','background-color':'white'});
	sendChat('Hal 9000',Rstyle.parseForChat(message));
});
```