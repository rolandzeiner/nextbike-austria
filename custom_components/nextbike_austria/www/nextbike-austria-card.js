/*! Nextbike Austria Card — bundled by Rolldown. Edit sources in src/, then `npm run build`. */
/**
* @license
* Copyright 2019 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap;var i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}};const a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:f,getPrototypeOf:te}=Object,p=globalThis,m=p.trustedTypes,h=m?m.emptyScript:``,g=p.reactiveElementPolyfillSupport,_=(e,t)=>e,v={toAttribute(e,t){
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
switch(t){case Boolean:e=e?h:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},y=(e,t)=>!l(e,t),b={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol(`metadata`),p.litPropertyMetadata??=new WeakMap;var x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=b){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??b}static _$Ei(){if(this.hasOwnProperty(_(`elementProperties`)))return;let e=te(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_(`properties`))){let e=this.properties,t=[...ee(e),...f(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?v:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?v:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??y)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:`open`},x[_(`elementProperties`)]=new Map,x[_(`finalized`)]=new Map,g?.({ReactiveElement:x}),(p.reactiveElementVersions??=[]).push(`2.1.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const S=globalThis,C=e=>e,w=S.trustedTypes,T=w?w.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,E=`$lit$`,D=`lit$${Math.random().toFixed(9).slice(2)}$`,O=`?`+D,ne=`<${O}>`,k=document,A=()=>k.createComment(``),j=e=>e===null||typeof e!=`object`&&typeof e!=`function`,re=Array.isArray,ie=e=>re(e)||typeof e?.[Symbol.iterator]==`function`,M=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ae=/-->/g,oe=/>/g,P=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),se=/'/g,ce=/"/g,le=/^(?:script|style|textarea|title)$/i,F=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),I=Symbol.for(`lit-noChange`),L=Symbol.for(`lit-nothing`),ue=new WeakMap,R=k.createTreeWalker(k,129);function de(e,t){if(!re(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return T===void 0?t:T.createHTML(t)}const fe=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=N;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===N?c[1]===`!--`?o=ae:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=P):(le.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=P):o=oe:o===P?c[0]===`>`?(o=i??N,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?P:c[3]===`"`?ce:se):o===ce||o===se?o=P:o===ae||o===oe?o=N:(o=P,i=void 0);let d=o===P&&e[t+1].startsWith(`/>`)?` `:``;a+=o===N?n+ne:l>=0?(r.push(s),n.slice(0,l)+E+n.slice(l)+D+d):n+D+(l===-2?t:d)}return[de(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]};var z=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=fe(t,n);if(this.el=e.createElement(l,r),R.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=R.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(E)){let t=u[o++],n=i.getAttribute(e).split(D),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?me:r[1]===`?`?he:r[1]===`@`?ge:H}),i.removeAttribute(e)}else e.startsWith(D)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(le.test(i.tagName)){let e=i.textContent.split(D),t=e.length-1;if(t>0){i.textContent=w?w.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],A()),R.nextNode(),c.push({type:2,index:++a});i.append(e[t],A())}}}else if(i.nodeType===8){if(i.data===O)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(D,e+1))!==-1;)c.push({type:7,index:a}),e+=D.length-1}}a++}}static createElement(e,t){let n=k.createElement(`template`);return n.innerHTML=e,n}};function B(e,t,n=e,r){if(t===I)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=j(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=B(e,i._$AS(e,t.values),i,r)),t}var pe=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??k).importNode(t,!0);R.currentNode=r;let i=R.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new V(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new _e(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=R.nextNode(),a++)}return R.currentNode=k,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},V=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=L,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=B(this,e,t),j(e)?e===L||e==null||e===``?(this._$AH!==L&&this._$AR(),this._$AH=L):e!==this._$AH&&e!==I&&this._(e):e._$litType$===void 0?e.nodeType===void 0?ie(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==L&&j(this._$AH)?this._$AA.nextSibling.data=e:this.T(k.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=z.createElement(de(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new pe(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=ue.get(e.strings);return t===void 0&&ue.set(e.strings,t=new z(e)),t}k(t){re(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(A()),this.O(A()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=C(e).nextSibling;C(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},H=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=L,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=L}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=B(this,e,t,0),a=!j(e)||e!==this._$AH&&e!==I,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=B(this,r[n+o],t,o),s===I&&(s=this._$AH[o]),a||=!j(s)||s!==this._$AH[o],s===L?e=L:e!==L&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===L?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},me=class extends H{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===L?void 0:e}},he=class extends H{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==L)}},ge=class extends H{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=B(this,e,t,0)??L)===I)return;let n=this._$AH,r=e===L&&n!==L||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==L&&(n===L||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},_e=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){B(this,e)}};const ve=S.litHtmlPolyfillSupport;ve?.(z,V),(S.litHtmlVersions??=[]).push(`3.3.2`);const ye=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new V(t.insertBefore(A(),e),e,void 0,n??{})}return i._$AI(e),i},U=globalThis
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
;var W=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ye(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};W._$litElement$=!0,W.finalized=!0,U.litElementHydrateSupport?.({LitElement:W});const be=U.litElementPolyfillSupport;be?.({LitElement:W}),(U.litElementVersions??=[]).push(`4.2.2`);
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
const xe=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},Se={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:y},Ce=(e=Se,t,n)=>{
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function G(e){return(t,n)=>typeof n==`object`?Ce(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/function K(e){return G({...e,state:!0,attribute:!1})}const we={nextbike_wr:`#DC2026`,nextbike_la:`#004E9E`,nextbike_si:`#C8102E`,nextbike_vt:`#009D58`,nextbike_al:`#E30613`,nextbike_ka:`#FFC20E`},q={en:{no_entities_picked:`No station selected`,no_entities_available:`No nextbike sensors found`,no_entities_unavailable:`Selected station is currently unavailable`,rack_summary:`Bike rack: {available} of {capacity} bikes available`,offline:`offline`,no_rental:`no rental`,no_return:`no return`,virtual_station:`virtual station`,bikes:`bikes`,bike:`bike`,docks:`docks`,dock:`dock`,ebikes:`e-bikes`,capacity:`capacity`,last_updated:`updated`,now:`just now`,seconds_ago:`{n}s ago`,minutes_ago:`{n}min ago`,hours_ago:`{n}h ago`,rent_in_app:`Rent in app`,open_map:`Map`,legend_bike:`Bike`,legend_ebike:`E-bike`,legend_empty:`Empty dock`,legend_overflow:`Overflow`,legend_reserved:`Reserved`,reserved:`Reserved`,legend_disabled:`Out of service`,disabled:`Out of service`,battery_unknown:`battery unknown`,version_update:`Nextbike Austria updated to v{v} — please reload`,version_reload:`Reload`,version_reload_stuck:`Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.`,editor:{entities_helper:`Pick one or more nextbike-austria sensors. Use Settings → Devices & Services to add more stations.`,section_display:`Display`,layout:`Multi-station layout`,layout_helper:`Stacked shows every station in one column; Tabs adds a tab strip when two or more stations are picked.`,layout_stacked:`Stacked`,layout_tabs:`Tabs`,show_rack:`Show bike rack`,show_legend:`Show legend`,show_battery:`Show battery in e-bike slot`,show_ebikes:`Show e-bikes`,show_docks:`Show docks`,show_flags:`Show status flags`,show_timestamp:`Show timestamp`,show_rent_button:`Show app-rent link`,hide_header:`Hide header`,hide_attribution:`Hide attribution`}},de:{no_entities_picked:`Keine Station ausgewählt`,no_entities_available:`Keine Nextbike-Sensoren gefunden`,no_entities_unavailable:`Ausgewählte Station ist gerade nicht verfügbar`,rack_summary:`Radständer: {available} von {capacity} Rädern verfügbar`,offline:`offline`,no_rental:`keine Ausleihe`,no_return:`keine Rückgabe`,virtual_station:`virtuelle Station`,bikes:`Räder`,bike:`Rad`,docks:`Plätze`,dock:`Platz`,ebikes:`E-Bikes`,capacity:`Kapazität`,last_updated:`aktualisiert`,now:`gerade eben`,seconds_ago:`vor {n}s`,minutes_ago:`vor {n}min`,hours_ago:`vor {n}h`,rent_in_app:`In App mieten`,open_map:`Karte`,legend_bike:`Rad`,legend_ebike:`E-Bike`,legend_empty:`Freier Platz`,legend_overflow:`Überzählig`,legend_reserved:`Reserviert`,reserved:`Reserviert`,legend_disabled:`Außer Betrieb`,disabled:`Außer Betrieb`,battery_unknown:`Batterie unbekannt`,version_update:`Nextbike Austria wurde auf v{v} aktualisiert — bitte neu laden`,version_reload:`Neu laden`,version_reload_stuck:`Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.`,editor:{entities_helper:`Eine oder mehrere Nextbike-Austria-Sensoren auswählen. Über Einstellungen → Geräte & Dienste lassen sich weitere Stationen hinzufügen.`,section_display:`Anzeige`,layout:`Layout für mehrere Stationen`,layout_helper:`„Gestapelt“ zeigt alle Stationen untereinander, „Reiter“ blendet ab zwei Stationen einen Reiter-Streifen ein.`,layout_stacked:`Gestapelt`,layout_tabs:`Reiter`,show_rack:`Bike-Rack anzeigen`,show_legend:`Legende anzeigen`,show_battery:`Batterie im E-Bike-Slot anzeigen`,show_ebikes:`E-Bike-Anzeige`,show_docks:`Plätze anzeigen`,show_flags:`Statussymbole anzeigen`,show_timestamp:`Zeitstempel anzeigen`,show_rent_button:`App-Mietlink anzeigen`,hide_header:`Kopfzeile ausblenden`,hide_attribution:`Datenquelle ausblenden`}}};function Te(e){return(e?.language||`en`).startsWith(`de`)?`de`:`en`}function J(e,t){let n=e;for(let e of t){if(typeof n!=`object`||!n)return;let t=n[e];if(t===void 0)return;n=t}return typeof n==`string`?n:void 0}function Ee(e,t){let n=Te(e);return J(q[n]??q.en,[t])??J(q.en,[t])??t}function De(e,t){let n=Te(e);return J(q[n]??q.en,[`editor`,t])??J(q.en,[`editor`,t])??t}async function Oe(e,t,n){if(!e?.callWS)return null;try{let r=await e.callWS({type:t});if(r?.version&&r.version!==n)return r.version}catch{}return null}function ke(e){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}if(e)try{window.sessionStorage?.setItem(`nb-reload-attempted-${e}`,`1`)}catch{}window.location.reload()}function Ae(e){if(!e)return!1;try{return window.sessionStorage?.getItem(`nb-reload-attempted-${e}`)===`1`}catch{return!1}}function je(e,t){if(!e)return L;if(Ae(e)){let e=t(`version_reload_stuck`);return F`
      <div class="banner" role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}let n=t(`version_update`).replace(`{v}`,e),r=t(`version_reload`);return F`
    <div class="banner" role="alert" aria-live="assertive">
      <span>${n}</span>
      <button
        type="button"
        aria-label=${r}
        @click=${()=>ke(e)}
      >
        ${r}
      </button>
    </div>
  `}const Me=o`
  :host {
    /* Card responds to its own column width, not the viewport — narrow
       dashboard columns trigger the compact layout even on wide screens.
       Slot size + spacing rhythm both flow from custom properties so a
       single density tier flips the whole card.

       Font sizes are in rem (root-relative, 16px baseline) so the user's
       browser/OS text-size preference reaches the card; padding/margin/gap
       stay in px aligned to HA's 4-px spacing scale.

       color-scheme enables light-dark() and steers forced-colors palette
       selection (WCAG 1.4.11). HA's active theme drives the resolution. */
    color-scheme: light dark;
    display: block;
    /* Fill the grid cell the dashboard gave us.
       A sections view puts a fixed pixel height on the cell WRAPPER whenever
       the card's rows are numeric -- which a user also causes by dragging the
       row handle, since a stored grid_options overrides what getGridOptions()
       returns -- and styles nothing inside that wrapper.
       This host is display: block, so IT is the containing block for the
       ha-card below, and a percentage height against a containing block whose
       own height is auto computes to auto. Without this line ha-card therefore
       sizes to its content, overflows a cell too short for it, and is painted
       over the card underneath. Taking the cell's height here is what gives
       ha-card's 100% something to resolve against.
       In an auto-height cell it resolves to auto -- the height it already had
       -- so it costs nothing there. */
    block-size: 100%;
    container-type: inline-size;
    container-name: nbcard;

    /* Brand accent — domain-specific, no HA equivalent. */
    --nb-accent: var(--primary-color);

    /* Semantic state tokens layered over HA's official semantic palette
       so theme authors can recolour the whole portfolio in one place;
       hard-coded fallbacks for older HA versions. */
    --nb-rt:      var(--success-color, #43a047);
    --nb-warning: var(--warning-color, #ffa000);
    --nb-error:   var(--error-color,   #db4437);
    --nb-info:    var(--info-color,    #1565c0);

    /* Spacing / radius / sizing — layered over the HA Design System
       so the card moves with HA when tokens evolve. Hard-coded values
       are the fallback for older HA versions. */
    /* These names were wrong until v1.3.1 and nothing complained: var()
       on a token HA does not define is not an error, it just resolves to
       the fallback. So the card ran entirely on its own literals while
       looking theme-aware — which is how --ha-spacing-3 came to mean
       14px on one line and 12px on the next.

       Verified against the frontend's src/resources/theme/core.globals.ts:
         --ha-space-N          4px grid, 1…20   (was --ha-spacing-N)
         --ha-font-size-*      xs 10 / s 12 / m 14 / l 16 / xl 20px.
                               typography.globals.ts sets the root to
                               font-size:14px, so -m is 1rem, NOT 0.875 —
                               do the rem maths at 14px or just write px.
         --ha-border-radius-*  sm 4 / md 8 / lg 12 / xl 16 / pill / circle
                                                (was --ha-radius-*)
         --ha-animation-duration-*  none 1 / instant 75 / fast 150 /
                                    normal 250 / slow 350ms
                                                (was --ha-transition-duration-*)
       There is no easing token — --ha-transition-easing-standard never
       existed either, so easings are now named directly.

       Fallbacks are kept and now match the token they stand in for.
       Adopting a new --ha-* token means checking core.globals.ts first;
       a typo here is invisible. */
    --nb-radius-sm: var(--ha-border-radius-sm, 4px);
    --nb-radius-md: var(--ha-border-radius-md, 8px);
    --nb-radius-lg: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
    --nb-pad-x:     var(--ha-space-4, 16px);
    --nb-pad-y:     var(--ha-space-3, 12px);
    --nb-row-gap:   var(--ha-space-3, 12px);
    --nb-slot-size: 18px;
    --nb-slot-height: 22px;
    --nb-slot-radius: 4px;
    --nb-slot-gap: 4px;
    --nb-tile-size: 40px;
  }
  ha-card {
    /* Resolves against the height :host just took from the cell, so
       overflow: hidden clips inside the card rather than the card spilling
       past its own cell. The two declarations only work as a pair: core cards
       that set this one alone leave :host at its default inline display, where
       the cell wrapper is ha-card's containing block instead. */
    block-size: 100%;

    overflow: hidden;
  }
  .wrap {
    padding: var(--nb-pad-y) var(--nb-pad-x);
    display: flex;
    flex-direction: column;
    gap: var(--nb-row-gap);
  }

  /* ── Banner ─────────────────────────────────────────────────────── */
  .banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: var(--nb-warning);
    color: #fff;
    padding: 10px 14px;
    margin: calc(var(--nb-pad-y) * -1) calc(var(--nb-pad-x) * -1) 0;
    border-radius: 0;
    font-size: 0.8125rem;
    font-weight: 500;
  }
  .banner button {
    background: #fff;
    color: var(--nb-warning);
    border: none;
    border-radius: 999px;
    padding: 6px 14px;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    min-height: 32px;
  }

  /* ── Tabs ───────────────────────────────────────────────────────── */
  .tabs {
    /* .tabs is a direct child of ha-card (NOT inside .wrap), so it sits
       flush with the card edges with no negative-margin escape. .wrap's
       own top padding provides breathing room to the first station. */
    display: flex;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.18));
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab {
    /* Fixed 44px height — meets WCAG 2.5.8 AAA touch target. Active
       indicator is a 2px box-shadow so the text stays vertically
       centred whether or not the tab is active. */
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 14px;
    background: none;
    border: none;
    box-shadow: inset 0 -2px 0 transparent;
    color: var(--secondary-text-color);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color var(--ha-animation-duration-fast, 150ms) ease, box-shadow var(--ha-animation-duration-fast, 150ms) ease,
      background-color var(--ha-animation-duration-fast, 150ms) ease;
  }
  .tab:hover {
    color: var(--primary-text-color);
    background: color-mix(in srgb, var(--primary-color) 6%, transparent);
  }
  .tab.active {
    /* Three independent active cues: colour, weight, underline.
       Survives any single-channel deficit (low vision, protanopia,
       grayscale). */
    color: var(--primary-color);
    font-weight: var(--ha-font-weight-bold, 700);
    box-shadow: inset 0 -2px 0 var(--primary-color);
  }

  /* ── Station section ────────────────────────────────────────────── */
  .station {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .station:not(:last-child) {
    padding-bottom: 14px;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
  }

  /* ── Header ─────────────────────────────────────────────────────── */
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .icon-tile {
    /* Modern HA "tile-card" vocabulary: rounded square, accent-tinted
       background, accent-coloured icon. Replaces the old 4px accent bar
       and gives the card immediate visual identity from across the
       dashboard. */
    width: var(--nb-tile-size);
    height: var(--nb-tile-size);
    border-radius: var(--nb-radius-md);
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--nb-accent) 18%, transparent);
    color: var(--nb-accent);
    --mdc-icon-size: 22px;
  }
  .header-text {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .title {
    /* <h2> override: nuke UA heading margins + set a strong but
       restrained card-header type size. Semantics only. Body tier
       (--ha-font-size-m ≈ 0.9375rem) keeps the heading aligned with
       the linz + wiener cards on a stacked dashboard. */
    margin: 0;
    font-size: var(--ha-font-size-m, 14px);
    font-weight: 600;
    line-height: 1.25;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .subtitle {
    /* <p> override. */
    margin: 0;
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    font-weight: 400;
    letter-spacing: 0.1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .icon-action {
    /* Map link rendered as an HA-style icon button — circular, 40×40
       touch target, hover/focus states matching native ha-icon-button. */
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--secondary-text-color);
    text-decoration: none;
    transition: background-color var(--ha-animation-duration-fast, 150ms) ease, color var(--ha-animation-duration-fast, 150ms) ease;
    --mdc-icon-size: 20px;
  }
  .icon-action:hover {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-color);
  }

  /* ── Hero metric ────────────────────────────────────────────────── */
  .hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .metric-value {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    line-height: 1;
  }
  .metric-num {
    font-size: 2.25rem;
    font-weight: var(--ha-font-weight-bold, 700);
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }
  .metric-of {
    font-size: 1rem;
    color: var(--secondary-text-color);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .metric-label {
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    font-weight: 500;
    letter-spacing: 0.2px;
    text-transform: uppercase;
  }

  /* ── Chips ──────────────────────────────────────────────────────── */
  .chip-row {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1;
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    color: var(--primary-color);
    font-variant-numeric: tabular-nums;
  }
  .chip ha-icon {
    --mdc-icon-size: 14px;
  }
  .chip.muted {
    background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
    color: var(--secondary-text-color);
  }
  .chip.ebike {
    /* E-bike chip uses the same amber as the rack diagonal stripe so
       the visual vocabulary stays consistent. */
    background: color-mix(in srgb, #ffd740 28%, transparent);
    color: var(--primary-text-color);
  }
  .chip.ebike ha-icon {
    color: #c28a00;
  }

  /* ── Rack ───────────────────────────────────────────────────────── */
  .rack-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .rack {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--nb-slot-gap);
    padding: 10px 12px;
    border-radius: var(--nb-radius-md);
    background: color-mix(in srgb, var(--nb-accent) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--nb-accent) 10%, transparent);
  }
  .slot {
    display: block;
    width: var(--nb-slot-size);
    height: var(--nb-slot-height);
    box-sizing: border-box;
    border-radius: var(--nb-slot-radius);
    flex: 0 0 var(--nb-slot-size);
    line-height: 0;
    padding: 0;
    margin: 0;
  }
  .slot.filled {
    background: var(--nb-accent);
    box-shadow: inset 0 -2px 0 color-mix(in srgb, #000 18%, transparent);
  }
  .slot.filled.ebike {
    background: linear-gradient(
      135deg,
      var(--nb-accent) 0%,
      var(--nb-accent) 55%,
      #ffd740 55%,
      #ffd740 100%
    );
  }
  /* Battery-fill variant: vertical gradient bottom (filled) → top (empty).
     --bat-pct and --bat-color set inline per slot. The empty portion is a
     desaturated version of the same hue so the shape still reads as an
     e-bike slot, with an outline so 0% remains visible. */
  .slot.filled.ebike.battery {
    background: linear-gradient(
      to top,
      var(--bat-color, #2ecc71) var(--bat-pct, 0%),
      color-mix(in srgb, var(--bat-color, #2ecc71) 15%, transparent)
        var(--bat-pct, 0%)
    );
    box-shadow: inset 0 0 0 1px
      color-mix(in srgb, var(--bat-color, #2ecc71) 60%, transparent);
  }
  .slot.empty {
    background: color-mix(in srgb, var(--secondary-text-color) 6%, transparent);
    box-shadow: inset 0 0 0 1px
      color-mix(in srgb, var(--secondary-text-color) 28%, transparent);
  }
  /* Reserved + disabled palettes are mirrored on .slot and
     .legend-swatch (a single source for the colour-mix incantation
     keeps slot + legend visually identical regardless of which one
     gets a future tweak). The dock-internal icon sizing differs (11px
     in slots vs 9px in legend swatches), so that bit stays per-class. */
  :host {
    --nb-reserved-bg: color-mix(in srgb, var(--secondary-text-color) 10%, transparent);
    --nb-reserved-border: color-mix(in srgb, var(--secondary-text-color) 50%, transparent);
    --nb-reserved-fg: var(--secondary-text-color);
    --nb-disabled-bg: color-mix(in srgb, #ffa726 16%, transparent);
    --nb-disabled-border: color-mix(in srgb, #ffa726 60%, transparent);
    --nb-disabled-fg: #e65100;
  }
  .slot.reserved,
  .slot.disabled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .slot.reserved {
    /* Reserved: bike present but held for another user. Neutral grey
       lock icon — distinct from disabled (amber wrench). */
    background: var(--nb-reserved-bg);
    box-shadow: inset 0 0 0 1px var(--nb-reserved-border);
    color: var(--nb-reserved-fg);
  }
  .slot.reserved ha-icon {
    --mdc-icon-size: 11px;
  }
  .slot.disabled {
    background: var(--nb-disabled-bg);
    box-shadow: inset 0 0 0 1px var(--nb-disabled-border);
    color: var(--nb-disabled-fg);
  }
  .slot.disabled ha-icon {
    --mdc-icon-size: 11px;
  }
  .rack-note {
    font-size: 0.7rem;
    line-height: var(--nb-slot-height);
    color: var(--secondary-text-color);
    margin-left: 6px;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  /* ── Legend ─────────────────────────────────────────────────────── */
  .legend {
    /* <dl> override: nuke UA dl margins so the legend stays tight. */
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin: 0;
    padding: 0 2px;
    font-size: 0.7rem;
    color: var(--secondary-text-color);
    /* Translated legend labels can be long ("Außer Betrieb") — allow
       wrapping so WCAG 1.4.12 text-spacing overrides don't clip. */
    overflow-wrap: anywhere;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .legend dd {
    /* <dd> default has margin-inline-start: 40px — reset. */
    margin: 0;
  }
  .legend-swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    box-sizing: border-box;
    border-radius: 3px;
    flex: 0 0 12px;
    line-height: 0;
    padding: 0;
    margin: 0;
    vertical-align: middle;
  }
  .legend-swatch.empty {
    background: color-mix(in srgb, var(--secondary-text-color) 6%, transparent);
    box-shadow: inset 0 0 0 1px
      color-mix(in srgb, var(--secondary-text-color) 28%, transparent);
  }
  .legend-swatch.reserved {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--nb-reserved-bg);
    box-shadow: inset 0 0 0 1px var(--nb-reserved-border);
    color: var(--nb-reserved-fg);
  }
  .legend-swatch.reserved ha-icon {
    --mdc-icon-size: 9px;
  }
  .legend-swatch.disabled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--nb-disabled-bg);
    box-shadow: inset 0 0 0 1px var(--nb-disabled-border);
    color: var(--nb-disabled-fg);
  }
  .legend-swatch.disabled ha-icon {
    --mdc-icon-size: 9px;
  }
  .legend-overflow {
    /* <dt> default is block — match the swatch inline presentation. */
    display: inline-flex;
    align-items: center;
    padding: 0 5px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  /* ── Status flags ───────────────────────────────────────────────── */
  .flags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .flag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 500;
    background: color-mix(in srgb, var(--secondary-text-color) 10%, transparent);
    color: var(--secondary-text-color);
  }
  .flag ha-icon {
    --mdc-icon-size: 14px;
  }
  .flag.warn {
    background: color-mix(in srgb, var(--nb-warning) 16%, transparent);
    color: var(--nb-warning);
  }
  .flag.err {
    background: color-mix(in srgb, var(--nb-error) 16%, transparent);
    color: var(--nb-error);
  }

  /* ── Action footer ──────────────────────────────────────────────── */
  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 0;
  }
  .btn-primary {
    /* HA-native filled-button look: filled with primary, white label,
       full-rounded radius. 32px tall — smaller than a primary touch
       target but still ≥24px (WCAG 2.5.8 AA minimum), and the parent
       .actions row reserves the surrounding tap area. */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 0 14px;
    height: 32px;
    border-radius: 999px;
    background: var(--nb-accent);
    color: var(--text-primary-color, #fff);
    font-size: 0.75rem;
    font-weight: 600;
    text-decoration: none;
    transition: filter var(--ha-animation-duration-fast, 150ms) ease, transform var(--ha-animation-duration-fast, 150ms) ease;
    box-shadow: 0 1px 2px color-mix(in srgb, #000 12%, transparent);
  }
  .btn-primary:hover {
    filter: brightness(1.08);
  }
  .btn-primary:active {
    transform: translateY(1px);
  }
  .btn-primary ha-icon {
    --mdc-icon-size: 16px;
  }
  .timestamp {
    font-size: 0.7rem;
    color: var(--secondary-text-color);
    margin-left: auto;
  }

  /* ── Attribution ────────────────────────────────────────────────── */
  .attr {
    margin-top: 2px;
    font-size: 0.65rem;
    color: var(--secondary-text-color);
    text-align: center;
    opacity: 0.6;
  }

  /* ── Empty / unavailable state ──────────────────────────────────── */
  .empty-state {
    padding: 24px 0;
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 0.875rem;
  }

  /* ── Responsive density tiers (container queries, not viewport) ──── */
  /* Compact: narrow phone columns, side-by-side dashboard panels. */
  @container nbcard (inline-size < 360px) {
    :host {
      --nb-pad-x: 14px;
      --nb-pad-y: 12px;
      --nb-slot-size: 14px;
      --nb-slot-height: 18px;
      --nb-slot-gap: 3px;
      --nb-tile-size: 36px;
    }
    .metric-num {
      font-size: 2rem;
    }
    .icon-tile {
      --mdc-icon-size: 20px;
    }
  }
  /* Wide: sidebar / panel mode / 2-column section view. */
  @container nbcard (inline-size > 480px) {
    :host {
      --nb-pad-x: 20px;
      --nb-pad-y: 16px;
      --nb-slot-size: 22px;
      --nb-slot-height: 26px;
      --nb-slot-gap: 5px;
      --nb-tile-size: 44px;
    }
    .metric-num {
      font-size: 2.5rem;
    }
    .icon-tile {
      --mdc-icon-size: 24px;
    }
  }

  /* ── Accessibility primitives ───────────────────────────────────── */
  /* Focus ring (WCAG 2.4.7 AA; 2px/3:1 also meets 2.4.13 AAA). */
  .tab:focus-visible,
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 6px;
  }
  /* Filled CTA reuses the same visible ring at a tighter offset so the
     ring doesn't break out of the rounded-pill shape. */
  .btn-primary:focus-visible {
    outline-offset: 3px;
  }

  /* Forced-colors fallback (Windows High Contrast). */
  @media (forced-colors: active) {
    .tab:focus-visible,
    a:focus-visible,
    button:focus-visible {
      outline-color: CanvasText;
    }
    .icon-tile,
    .chip,
    .flag,
    .btn-primary {
      forced-color-adjust: none;
    }
  }

  /* Honour user motion preference (catch-all). */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`,Ne=new Set([`143`,`183`,`200`]);function Pe(e){let t=e?.e_bike_vehicle_type_ids;if(Array.isArray(t)&&t.length>0){let e=t.filter(e=>typeof e==`string`&&e.length>0);if(e.length>0)return new Set(e)}return Ne}function Fe(e){return typeof e==`string`&&/^https?:\/\//i.test(e)?e:``}function Y(e){return!e||!e.states?[]:Object.keys(e.states).filter(t=>{if(!t.startsWith(`sensor.`))return!1;let n=e.states[t];if(!n)return!1;let r=n.attributes;return!!r&&typeof r.station_id==`string`&&typeof r.system_id==`string`&&r.system_id.startsWith(`nextbike_`)&&typeof r.attribution==`string`&&r.attribution.startsWith(`Data: nextbike`)})}function Ie(e){return typeof e==`string`?e.includes(`.`)?{entity:e}:null:!e||typeof e!=`object`||typeof e.entity!=`string`?null:{entity:e.entity}}function X(e){let t={...e||{}};return typeof t.entity==`string`&&t.entity.includes(`.`)&&(!Array.isArray(t.entities)||t.entities.length===0)&&(t.entities=[{entity:t.entity}]),delete t.entity,t.entities=(Array.isArray(t.entities)?t.entities:[]).map(Ie).filter(e=>e!==null),t.show_rack=t.show_rack!==!1,t.show_legend=t.show_legend!==!1,t.show_ebikes=t.show_ebikes!==!1,t.show_battery=t.show_battery!==!1,t.show_docks=t.show_docks!==!1,t.show_flags=t.show_flags!==!1,t.show_timestamp=t.show_timestamp!==!1,t.show_rent_button=t.show_rent_button!==!1,t.hide_header=t.hide_header===!0,t.hide_attribution=t.hide_attribution===!0,t.layout!==`tabs`&&(t.layout=`stacked`),t}function Le(e){let t=e?.vehicle_types_available;if(!Array.isArray(t))return null;let n=Pe(e),r=0;for(let e of t){if(!e||typeof e!=`object`)continue;let t=e,i=String(t.vehicle_type_id??``),a=t.count;n.has(i)&&typeof a==`number`&&Number.isFinite(a)&&(r+=a)}return r}function Re(e,t,n){if(!Array.isArray(e))return null;for(let r of e){let e=String(r?.vehicle_type_id??``);if(n.has(e)&&t?.[e])return t[e]}return null}function ze(e,t,n){let r=[];if(!Array.isArray(e))return r;for(let i of e){let e=String(i?.vehicle_type_id??``),a=typeof i?.count==`number`&&Number.isFinite(i.count)?i.count:0;if(n.has(e)||a<=0)continue;let o=t?.[e]||``;for(let e=0;e<a;e++)r.push(o)}return r}function Be(e){return typeof e!=`number`||!Number.isFinite(e)||e>=75?`#2ecc71`:e>=50?`#8bc34a`:e>=25?`#ffa726`:`#e53935`}function Ve(e,t){let n=null;if(typeof e==`number`&&Number.isFinite(e))n=e>1e11?e/1e3:e;else if(typeof e==`string`&&e.length>0){let t=Date.parse(e);Number.isFinite(t)&&(n=t/1e3)}if(n===null)return null;let r=Math.max(0,Math.floor(Date.now()/1e3-n));return r<10?t(`now`):r<60?t(`seconds_ago`).replace(`{n}`,String(r)):r<3600?t(`minutes_ago`).replace(`{n}`,String(Math.floor(r/60))):t(`hours_ago`).replace(`{n}`,String(Math.floor(r/3600)))}function He(e){return String(e).replace(/\s+(Bikes available|Räder verfügbar)$/,``)}function Ue(e,t){let n=e?.station_display_name;if(typeof n==`string`&&n)return n;let r=e?.friendly_name;return He(typeof r==`string`&&r?r:t)}const We=o`
  :host {
    color-scheme: light dark;
    display: block;
  }
  .editor {
    padding: var(--ha-space-4, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--ha-space-3, 12px);
  }
  ha-form {
    display: block;
  }
`;function Z(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}function Ge(e,t,n){let r=new CustomEvent(t,{detail:n,bubbles:!0,composed:!0});e.dispatchEvent(r)}let Q=class extends W{constructor(...e){super(...e),this._config={type:`nextbike-austria-card`,entities:[]},this._computeLabel=e=>{let t=`ui.panel.lovelace.editor.card.generic.${e.name}`,n=this.hass?.localize?.(t);if(n)return n;let r=this._t(e.name);return r===e.name?e.name:r},this._computeHelper=e=>{let t=`${e.name}_helper`,n=this._t(t);return n===t?void 0:n},this._onFormChanged=e=>{let t=e.detail.value,n=t.entities,r=Array.isArray(n)?n.filter(e=>typeof e==`string`&&e.length>0).map(e=>({entity:e})):[],i=X({...t,entities:r});this._config=i,Ge(this,`config-changed`,{config:i})}}static{this.styles=We}setConfig(e){this._config=X(e)}_t(e){return De(this.hass,e)}_schema(){return[{name:`entities`,required:!0,selector:{entity:{multiple:!0,filter:{domain:`sensor`,integration:`nextbike_austria`}}}},{name:`layout`,selector:{select:{mode:`dropdown`,options:[{value:`stacked`,label:this._t(`layout_stacked`)},{value:`tabs`,label:this._t(`layout_tabs`)}]}}},{type:`expandable`,name:`display`,title:this._t(`section_display`),flatten:!0,schema:[{name:`hide_header`,selector:{boolean:{}}},{name:`show_rack`,selector:{boolean:{}}},{name:`show_legend`,selector:{boolean:{}}},{name:`show_battery`,selector:{boolean:{}}},{name:`show_ebikes`,selector:{boolean:{}}},{name:`show_docks`,selector:{boolean:{}}},{name:`show_flags`,selector:{boolean:{}}},{name:`show_timestamp`,selector:{boolean:{}}},{name:`show_rent_button`,selector:{boolean:{}}},{name:`hide_attribution`,selector:{boolean:{}}}]}]}_formData(){let e=(this._config.entities??[]).map(e=>e.entity).filter(e=>typeof e==`string`&&e.length>0);return{...this._config,entities:e}}render(){return this._config?F`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData()}
          .schema=${this._schema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._onFormChanged}
        ></ha-form>
      </div>
    `:L}};Z([G({attribute:!1})],Q.prototype,`hass`,void 0),Z([K()],Q.prototype,`_config`,void 0),Q=Z([xe(`nextbike-austria-card-editor`)],Q);let $=class extends W{constructor(...e){super(...e),this._config={type:`nextbike-austria-card`,entities:[]},this._activeTab=0,this._versionMismatch=null,this._tickKey=0,this._tickTimer=null,this._versionChecked=!1,this._resolvedEntitiesMemo=null}static{this.styles=Me}setConfig(e){if(typeof e!=`object`||!e||Array.isArray(e))throw Error(`nextbike-austria-card: config must be an object`);this._config=X(e)}connectedCallback(){super.connectedCallback(),this._tickTimer||=setInterval(()=>{this._tickKey++},6e4)}disconnectedCallback(){super.disconnectedCallback(),this._tickTimer&&=(clearInterval(this._tickTimer),null)}willUpdate(e){if(this._resolvedEntitiesMemo=null,e.has(`hass`)&&this.hass&&!this._versionChecked&&(this._versionChecked=!0,this._checkCardVersion()),e.has(`_config`)||e.has(`hass`)){let e=this._resolveEntities();this._config.layout===`tabs`&&e.length>=2&&this._activeTab>=e.length&&(this._activeTab=0)}}shouldUpdate(e){if(!this._config)return!1;if(e.has(`_config`)||e.has(`_activeTab`)||e.has(`_versionMismatch`)||e.has(`_tickKey`))return!0;if(!e.has(`hass`))return!1;let t=e.get(`hass`);return t?this.hass?this._resolveEntities(this.hass,!1).some(e=>t.states[e.entity]!==this.hass.states[e.entity]):!1:!0}getCardSize(){let e=this.hass?this._resolveEntities().length||1:this._config.entities.length||1;return Math.min(12,3+e*3)}getGridOptions(){return{columns:12,rows:`auto`,min_columns:6,min_rows:3}}static async getConfigElement(){return document.createElement(`nextbike-austria-card-editor`)}static getStubConfig(e){let t=Y(e)[0];return{entities:t?[{entity:t}]:[]}}async _checkCardVersion(){this._versionMismatch=await Oe(this.hass,`nextbike_austria/card_version`,`1.3.2`)}_t(e){return Ee(this.hass,e)}_resolveEntities(e=this.hass,t=!0){let n=t&&e===this.hass;if(n&&this._resolvedEntitiesMemo!==null)return this._resolvedEntitiesMemo;let r=Array.isArray(this._config?.entities)?this._config.entities.filter(t=>e?.states[t.entity]):[],i;if(r.length)i=r;else{let t=Y(e)[0];i=t?[{entity:t}]:[]}return n&&(this._resolvedEntitiesMemo=i),i}render(){if(!this.hass||!this._config)return L;let e=this._resolveEntities(),t=this._config.layout===`tabs`&&e.length>=2,n=e.map(e=>this.hass?.states[e.entity]?.attributes?.attribution).find(e=>typeof e==`string`&&e.length>0)||`Data: nextbike GmbH, CC0-1.0`,r;if(!e.length)r=this._renderEmpty();else if(t){let t=e[this._activeTab]??e[0];r=this._renderStation(t,this._activeTab)}else r=e.map(e=>this._renderStation(e));return F`
      <ha-card>
        ${t?this._renderTabs(e):L}
        <div class="wrap">
          ${je(this._versionMismatch,e=>this._t(e))}
          ${r}
          ${this._config.hide_attribution?L:F`<div class="attr">${n}</div>`}
        </div>
      </ha-card>
    `}_renderEmpty(){let e=Y(this.hass).length?`no_entities_picked`:`no_entities_available`;return F`<div class="empty-state" role="status">${this._t(e)}</div>`}_renderTabs(e){return F`
      <div class="tabs" role="tablist">
        ${e.map((t,n)=>{let r=this.hass?.states[t.entity]?.attributes||{},i=typeof r.friendly_name==`string`&&r.friendly_name.length>0,a=Ue(r,t.entity),o=n===this._activeTab;return F`
            <button
              type="button"
              role="tab"
              id=${`nbtab-${n}`}
              aria-controls=${`nbpanel-${n}`}
              class="tab ${o?`active`:``}"
              aria-selected=${o?`true`:`false`}
              tabindex=${o?`0`:`-1`}
              @click=${()=>this._setActiveTab(n)}
              @keydown=${t=>this._onTabKeydown(t,n,e.length)}
            >
              ${i?F`<span lang="de">${a}</span>`:a}
            </button>
          `})}
      </div>
    `}_setActiveTab(e){Number.isFinite(e)&&e!==this._activeTab&&(this._activeTab=e)}_onTabKeydown(e,t,n){let r=t;switch(e.key){case`ArrowRight`:r=(t+1)%n;break;case`ArrowLeft`:r=(t-1+n)%n;break;case`Home`:r=0;break;case`End`:r=n-1;break;default:return}e.preventDefault(),this._setActiveTab(r),this.updateComplete.then(()=>{(this.shadowRoot?.querySelectorAll(`.tabs [role="tab"]`))?.[r]?.focus()})}_renderStation(e,t){let n=this.hass?.states[e.entity];if(!n)return F`<div class="empty-state" role="status">${this._t(`no_entities_unavailable`)}</div>`;let r=n.attributes||{},i=parseInt(n.state,10),a=Number.isFinite(i)?Math.max(0,i):0,o=typeof r.capacity==`number`?r.capacity:null,s=typeof r.num_docks_available==`number`?r.num_docks_available:null,c=Le(r),l=typeof r.e_bike_avg_battery_pct==`number`?r.e_bike_avg_battery_pct:null,u=typeof r.e_bike_range_samples==`number`?r.e_bike_range_samples:0,d=Array.isArray(r.e_bike_battery_list)?r.e_bike_battery_list:null,ee=r.vehicle_type_names&&typeof r.vehicle_type_names==`object`?r.vehicle_type_names:{},f=Array.isArray(r.vehicle_types_available)?r.vehicle_types_available:[],te=Pe(r),p=typeof r.bikes_reserved==`number`?r.bikes_reserved:0,m=Array.isArray(r.bikes_reserved_types)?r.bikes_reserved_types:[],h=typeof r.bikes_disabled==`number`?r.bikes_disabled:0,g=Array.isArray(r.bikes_disabled_types)?r.bikes_disabled_types:[],_=r.system_id||``,v=we[_]||`var(--primary-color)`,y=typeof r.system_label==`string`&&r.system_label||_.replace(/^nextbike_/,``),b=Fe(r.rental_uri),x=typeof r.friendly_name==`string`&&r.friendly_name.length>0,S=Ue(r,e.entity),C=typeof r.latitude==`number`&&typeof r.longitude==`number`&&Fe(`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`)||null,w=a===1?this._t(`bike`):this._t(`bikes`),T=this._renderPills(c,s,o),E=typeof t==`number`;return F`
      <section
        class="station"
        aria-label=${S}
        role=${E?`tabpanel`:L}
        id=${E?`nbpanel-${t}`:L}
        aria-labelledby=${E?`nbtab-${t}`:L}
        tabindex=${E?`-1`:L}
        style=${`--nb-accent:${v};`}
      >
        ${this._config.hide_header?L:F`<header class="header">
              <div class="icon-tile" aria-hidden="true">
                <ha-icon icon="mdi:bicycle"></ha-icon>
              </div>
              <div class="header-text">
                <h2 class="title">
                  ${x?F`<span lang="de">${S}</span>`:S}
                </h2>
                <p class="subtitle">${y}</p>
              </div>
              ${C?F`
                    <a
                      class="icon-action"
                      href=${C}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label=${`${this._t(`open_map`)}: ${S}`}
                      title=${this._t(`open_map`)}
                    >
                      <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>
                    </a>
                  `:L}
            </header>`}

        <div class="hero">
          <div class="metric">
            <div class="metric-value">
              <span class="metric-num">${a}</span>
              ${o===null?L:F`<span class="metric-of">/ ${o}</span>`}
            </div>
            <div class="metric-label">${w}</div>
          </div>
          ${T.length?F`<div class="chip-row">${T}</div>`:L}
        </div>

        ${this._config.show_rack&&o!==null&&o>0?this._renderRack({bikes:a,ebikes:c,capacity:o,accent:v,batteryPct:l,batterySamples:u,batteryList:d,vehicleTypesAvailable:f,vehicleTypeNames:ee,ebikeIds:te,reservedCount:p,reservedTypes:m,disabledCount:h,disabledTypes:g}):L}

        ${this._config.show_flags?this._renderFlags(r):L}
        ${this._renderFooter(r,b)}
      </section>
    `}_renderPills(e,t,n){let r=[];if(this._config.show_ebikes&&typeof e==`number`&&Number.isFinite(e)&&e>0&&r.push(F`
        <span class="chip ebike">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon>${e}
          ${this._t(`ebikes`)}
        </span>
      `),this._config.show_docks&&t!==null&&n!==null){let e=t===1?this._t(`dock`):this._t(`docks`);r.push(F`
        <span class="chip muted">
          <ha-icon icon="mdi:parking"></ha-icon>${t} ${e}
        </span>
      `)}return r}_renderRack(e){let{bikes:t,ebikes:n,capacity:r,accent:i,batteryPct:a,batterySamples:o,batteryList:s,vehicleTypesAvailable:c,vehicleTypeNames:l,ebikeIds:u,reservedCount:d,reservedTypes:ee,disabledCount:f,disabledTypes:te}=e,p=r,m=Math.min(t,r),h=Math.min(d,Math.max(0,p-m)),g=Math.min(f,Math.max(0,p-m-h)),_=typeof n==`number`&&Number.isFinite(n)&&n>0,v=_?Math.min(m,n):0,y=!!this._config.show_battery&&typeof a==`number`&&o>0,b=y&&Array.isArray(s)?s:[],x=_||p>0,S=x?Re(c,l,u):null,C=x?ze(c,l,u):[],w=0,T=[];for(let e=0;e<m;e++)if(e<v){let t=b[e]||null,n=t?.type||S||this._t(`legend_ebike`);if(t&&y&&typeof t.pct==`number`){let e=t.pct,r=Be(e),i=`${n} · ${Math.round(e)}%`;T.push(F`
            <div
              class="slot filled ebike battery"
              role="img"
              aria-label=${i}
              style=${`--bat-pct:${e}%;--bat-color:${r};`}
              title=${i}
            ></div>
          `)}else{let e=y?`${n} · ${this._t(`battery_unknown`)}`:n;T.push(F`
            <div
              class="slot filled ebike"
              role="img"
              aria-label=${e}
              style=${`background:linear-gradient(135deg, ${i} 0%, ${i} 55%, #ffd740 55%, #ffd740 100%);`}
              title=${e}
            ></div>
          `)}}else{let e=C[w++]||this._t(`legend_bike`);T.push(F`
          <div
            class="slot filled"
            role="img"
            aria-label=${e}
            style=${`background:${i};`}
            title=${e}
          ></div>
        `)}let E=this._t(`reserved`);for(let e=0;e<h;e++){let t=ee?.[e],n=t?`${t} · ${E}`:E;T.push(F`
        <div
          class="slot reserved"
          role="img"
          aria-label=${n}
          title=${n}
        >
          <ha-icon icon="mdi:lock" aria-hidden="true"></ha-icon>
        </div>
      `)}let D=this._t(`disabled`);for(let e=0;e<g;e++){let t=te?.[e],n=t?`${t} · ${D}`:D;T.push(F`
        <div
          class="slot disabled"
          role="img"
          aria-label=${n}
          title=${n}
        >
          <ha-icon icon="mdi:wrench" aria-hidden="true"></ha-icon>
        </div>
      `)}for(let e=m+h+g;e<p;e++){let e=this._t(`legend_empty`);T.push(F`
        <div
          class="slot empty"
          role="img"
          aria-label=${e}
          title=${e}
        ></div>
      `)}let O=t>r,ne=m+h+g<p,k=h>0,A=g>0,j=this._t(`rack_summary`).replace(`{available}`,String(m)).replace(`{capacity}`,String(r));return F`
      <div class="rack-block">
        <div class="rack" role="group" aria-label=${j}>
          ${T}
          ${O?F`<span
                class="rack-note"
                aria-label=${`+${t-r}`}
                >+${t-r}</span
              >`:L}
        </div>
        ${this._config.show_legend?this._renderLegend({accent:i,hasEbikes:_,hasOverflow:O,hasEmptyVisible:ne,battery:y&&typeof a==`number`?{pct:a,color:Be(a)}:null,hasReservedVisible:k,hasDisabledVisible:A}):L}
      </div>
    `}_renderLegend(e){let{accent:t,hasEbikes:n,hasOverflow:r,hasEmptyVisible:i,battery:a,hasReservedVisible:o,hasDisabledVisible:s}=e,c=[F`
        <div class="legend-item">
          <dt class="legend-swatch" style=${`background:${t}`} aria-hidden="true"></dt>
          <dd>${this._t(`legend_bike`)}</dd>
        </div>
      `];if(n){let e=a?`background:linear-gradient(to top, #2ecc71 70%, color-mix(in srgb, #2ecc71 15%, transparent) 70%);outline:1px solid color-mix(in srgb, #2ecc71 60%, transparent);outline-offset:-1px;`:`background:linear-gradient(135deg, ${t} 0%, ${t} 55%, #ffd740 55%, #ffd740 100%);`;c.push(F`
        <div class="legend-item">
          <dt class="legend-swatch" style=${e} aria-hidden="true"></dt>
          <dd>${this._t(`legend_ebike`)}</dd>
        </div>
      `)}return o&&c.push(F`
        <div class="legend-item">
          <dt class="legend-swatch reserved" aria-hidden="true">
            <ha-icon icon="mdi:lock"></ha-icon>
          </dt>
          <dd>${this._t(`legend_reserved`)}</dd>
        </div>
      `),s&&c.push(F`
        <div class="legend-item">
          <dt class="legend-swatch disabled" aria-hidden="true">
            <ha-icon icon="mdi:wrench"></ha-icon>
          </dt>
          <dd>${this._t(`legend_disabled`)}</dd>
        </div>
      `),i&&c.push(F`
        <div class="legend-item">
          <dt class="legend-swatch empty" aria-hidden="true"></dt>
          <dd>${this._t(`legend_empty`)}</dd>
        </div>
      `),r&&c.push(F`
        <div class="legend-item">
          <dt class="legend-overflow" aria-hidden="true">+N</dt>
          <dd>${this._t(`legend_overflow`)}</dd>
        </div>
      `),F`<dl class="legend">${c}</dl>`}_renderFlags(e){let t=[];return e.is_installed===!1&&t.push(F`
        <span class="flag err">
          <ha-icon icon="mdi:alert-circle"></ha-icon>${this._t(`offline`)}
        </span>
      `),e.is_renting===!1&&t.push(F`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t(`no_rental`)}
        </span>
      `),e.is_returning===!1&&t.push(F`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t(`no_return`)}
        </span>
      `),e.is_virtual_station===!0&&t.push(F`
        <span class="flag">
          <ha-icon icon="mdi:map-marker-radius"></ha-icon>${this._t(`virtual_station`)}
        </span>
      `),t.length?F`<div class="flags">${t}</div>`:L}_renderFooter(e,t){let n=!!this._config.show_rent_button&&!!t,r=this._config.show_timestamp?Ve(e.last_reported,e=>this._t(e)):null;return!n&&!r?L:F`
      <div class="actions">
        ${n?F`
              <a
                class="btn-primary"
                href=${t}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ha-icon
                  icon="mdi:cellphone-arrow-down"
                  aria-hidden="true"
                ></ha-icon>
                ${this._t(`rent_in_app`)}
              </a>
            `:L}
        ${r?F`<span class="timestamp"
              >${this._t(`last_updated`)} ${r}</span
            >`:L}
      </div>
    `}};Z([G({attribute:!1})],$.prototype,`hass`,void 0),Z([K()],$.prototype,`_config`,void 0),Z([K()],$.prototype,`_activeTab`,void 0),Z([K()],$.prototype,`_versionMismatch`,void 0),Z([K()],$.prototype,`_tickKey`,void 0),$=Z([xe(`nextbike-austria-card`)],$);const Ke=window;Ke.customCards??=[],Ke.customCards.push({type:`nextbike-austria-card`,name:`Nextbike Austria Card`,description:`Station dashboard for nextbike-operated bike-sharing in Austria — bikes, docks, e-bikes, rental deep-link.`,preview:!0,documentationURL:`https://github.com/rolandzeiner/nextbike-austria`,getEntitySuggestion:(e,t)=>!t.startsWith(`sensor.`)||e?.entities?.[t]?.platform!==`nextbike_austria`?null:{config:{type:`custom:nextbike-austria-card`,entities:[{entity:t}]}}});