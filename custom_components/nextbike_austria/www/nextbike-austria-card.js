// Nextbike Austria Card — bundled by Rollup. Edit sources in src/, then `npm run build`.
const e="1.0.0",t={nextbike_wr:"#DC2026",nextbike_la:"#004E9E",nextbike_si:"#C8102E",nextbike_vt:"#009D58",nextbike_al:"#E30613",nextbike_ka:"#FFC20E"},i={nextbike_wr:"Wien",nextbike_la:"Niederösterreich",nextbike_si:"Innsbruck",nextbike_vt:"Tirol",nextbike_al:"Linz",nextbike_ka:"Klagenfurt"},s=new Set(["143","183","200"]);function r(e,t,i,s){var r,n=arguments.length,o=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,s);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(o=(n<3?r(o):n>3?r(t,i,o):r(t,i))||o);return n>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const n=globalThis,o=n.ShadowRoot&&(void 0===n.ShadyCSS||n.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),l=new WeakMap;let c=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(o&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=l.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&l.set(t,e))}return e}toString(){return this.cssText}};const d=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new c(i,e,a)},h=o?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new c("string"==typeof e?e:e+"",void 0,a))(t)})(e):e,{is:p,defineProperty:u,getOwnPropertyDescriptor:b,getOwnPropertyNames:g,getOwnPropertySymbols:_,getPrototypeOf:f}=Object,y=globalThis,m=y.trustedTypes,v=m?m.emptyScript:"",x=y.reactiveElementPolyfillSupport,$=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?v:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},k=(e,t)=>!p(e,t),A={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:k};Symbol.metadata??=Symbol("metadata"),y.litPropertyMetadata??=new WeakMap;let S=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=A){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&u(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=b(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const n=s?.call(this);r?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??A}static _$Ei(){if(this.hasOwnProperty($("elementProperties")))return;const e=f(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty($("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty($("properties"))){const e=this.properties,t=[...g(e),..._(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(h(e))}else void 0!==e&&t.push(h(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(o)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of t){const t=document.createElement("style"),s=n.litNonce;void 0!==s&&t.setAttribute("nonce",s),t.textContent=i.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=s;const n=r.fromAttribute(t,e.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(void 0!==e){const n=this.constructor;if(!1===s&&(r=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??k)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==r||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[$("elementProperties")]=new Map,S[$("finalized")]=new Map,x?.({ReactiveElement:S}),(y.reactiveElementVersions??=[]).push("2.1.2");const E=globalThis,C=e=>e,T=E.trustedTypes,z=T?T.createPolicy("lit-html",{createHTML:e=>e}):void 0,P="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,R="?"+M,N=`<${R}>`,O=document,U=()=>O.createComment(""),H=e=>null===e||"object"!=typeof e&&"function"!=typeof e,j=Array.isArray,D="[ \t\n\f\r]",B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,I=/>/g,F=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),W=/'/g,K=/"/g,V=/^(?:script|style|textarea|title)$/i,q=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),G=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),J=new WeakMap,X=O.createTreeWalker(O,129);function Q(e,t){if(!j(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==z?z.createHTML(t):t}const Y=(e,t)=>{const i=e.length-1,s=[];let r,n=2===t?"<svg>":3===t?"<math>":"",o=B;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===B?"!--"===l[1]?o=L:void 0!==l[1]?o=I:void 0!==l[2]?(V.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=F):void 0!==l[3]&&(o=F):o===F?">"===l[0]?(o=r??B,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?F:'"'===l[3]?K:W):o===K||o===W?o=F:o===L||o===I?o=B:(o=F,r=void 0);const h=o===F&&e[t+1].startsWith("/>")?" ":"";n+=o===B?i+N:c>=0?(s.push(a),i.slice(0,c)+P+i.slice(c)+M+h):i+M+(-2===c?t:h)}return[Q(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class ee{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,n=0;const o=e.length-1,a=this.parts,[l,c]=Y(e,t);if(this.el=ee.createElement(l,i),X.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=X.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(P)){const t=c[n++],i=s.getAttribute(e).split(M),o=/([.?@])?(.*)/.exec(t);a.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?ne:"?"===o[1]?oe:"@"===o[1]?ae:re}),s.removeAttribute(e)}else e.startsWith(M)&&(a.push({type:6,index:r}),s.removeAttribute(e));if(V.test(s.tagName)){const e=s.textContent.split(M),t=e.length-1;if(t>0){s.textContent=T?T.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],U()),X.nextNode(),a.push({type:2,index:++r});s.append(e[t],U())}}}else if(8===s.nodeType)if(s.data===R)a.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(M,e+1));)a.push({type:7,index:r}),e+=M.length-1}r++}}static createElement(e,t){const i=O.createElement("template");return i.innerHTML=e,i}}function te(e,t,i=e,s){if(t===G)return t;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const n=H(t)?void 0:t._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(e),r._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(t=te(e,r._$AS(e,t.values),r,s)),t}class ie{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??O).importNode(t,!0);X.currentNode=s;let r=X.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let t;2===a.type?t=new se(r,r.nextSibling,this,e):1===a.type?t=new a.ctor(r,a.name,a.strings,this,e):6===a.type&&(t=new le(r,this,e)),this._$AV.push(t),a=i[++o]}n!==a?.index&&(r=X.nextNode(),n++)}return X.currentNode=O,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class se{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=te(this,e,t),H(e)?e===Z||null==e||""===e?(this._$AH!==Z&&this._$AR(),this._$AH=Z):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>j(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==Z&&H(this._$AH)?this._$AA.nextSibling.data=e:this.T(O.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=ee.createElement(Q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new ie(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=J.get(e.strings);return void 0===t&&J.set(e.strings,t=new ee(e)),t}k(e){j(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new se(this.O(U()),this.O(U()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=C(e).nextSibling;C(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class re{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(e,t=this,i,s){const r=this.strings;let n=!1;if(void 0===r)e=te(this,e,t,0),n=!H(e)||e!==this._$AH&&e!==G,n&&(this._$AH=e);else{const s=e;let o,a;for(e=r[0],o=0;o<r.length-1;o++)a=te(this,s[i+o],t,o),a===G&&(a=this._$AH[o]),n||=!H(a)||a!==this._$AH[o],a===Z?e=Z:e!==Z&&(e+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!s&&this.j(e)}j(e){e===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ne extends re{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===Z?void 0:e}}class oe extends re{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==Z)}}class ae extends re{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=te(this,e,t,0)??Z)===G)return;const i=this._$AH,s=e===Z&&i!==Z||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==Z&&(i===Z||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class le{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){te(this,e)}}const ce=E.litHtmlPolyfillSupport;ce?.(ee,se),(E.litHtmlVersions??=[]).push("3.3.2");const de=globalThis;class he extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let r=s._$litPart$;if(void 0===r){const e=i?.renderBefore??null;s._$litPart$=r=new se(t.insertBefore(U(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}he._$litElement$=!0,he.finalized=!0,de.litElementHydrateSupport?.({LitElement:he});const pe=de.litElementPolyfillSupport;pe?.({LitElement:he}),(de.litElementVersions??=[]).push("4.2.2");const ue=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},be={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:k},ge=(e=be,t,i)=>{const{kind:s,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,r,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];t.call(this,i),this.requestUpdate(s,r,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function _e(e){return(t,i)=>"object"==typeof i?ge(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function fe(e){return _e({...e,state:!0,attribute:!1})}const ye={en:{no_entities_picked:"No station selected",no_entities_available:"No nextbike sensors found",no_entities_unavailable:"Selected station is currently unavailable",rack_summary:"Bike rack: {available} of {capacity} bikes available",offline:"offline",no_rental:"no rental",no_return:"no return",virtual_station:"virtual station",bikes:"bikes",bike:"bike",docks:"docks",dock:"dock",ebikes:"e-bikes",capacity:"capacity",last_updated:"updated",now:"just now",seconds_ago:"{n}s ago",minutes_ago:"{n}min ago",hours_ago:"{n}h ago",rent_in_app:"Rent in app",open_map:"Map",legend_bike:"Bike",legend_ebike:"E-bike",legend_empty:"Empty dock",legend_overflow:"Overflow",legend_reserved:"Reserved",reserved:"Reserved",legend_disabled:"Out of service",disabled:"Out of service",battery_unknown:"battery unknown",version_update:"Nextbike Austria updated to v{v} — please reload",version_reload:"Reload",editor:{section_stations:"Stations",stations_hint:"Show one or more stations.",section_display:"Display",layout_label:"Multi-station layout",layout_stacked:"Stacked",layout_tabs:"Tabs",show_rack:"Show bike rack",show_legend:"Show legend",show_battery:"Show battery in e-bike slot",show_ebikes:"Show e-bikes",show_docks:"Show docks",show_flags:"Show status flags",show_timestamp:"Show timestamp",show_rent_button:"Show app-rent link",hide_attribution:"Hide attribution",no_sensors_available:"No nextbike sensors available. Add a station first via Settings → Devices & Services."}},de:{no_entities_picked:"Keine Station ausgewählt",no_entities_available:"Keine Nextbike-Sensoren gefunden",no_entities_unavailable:"Ausgewählte Station ist gerade nicht verfügbar",rack_summary:"Radständer: {available} von {capacity} Rädern verfügbar",offline:"offline",no_rental:"keine Ausleihe",no_return:"keine Rückgabe",virtual_station:"virtuelle Station",bikes:"Räder",bike:"Rad",docks:"Plätze",dock:"Platz",ebikes:"E-Bikes",capacity:"Kapazität",last_updated:"aktualisiert",now:"gerade eben",seconds_ago:"vor {n}s",minutes_ago:"vor {n}min",hours_ago:"vor {n}h",rent_in_app:"In App mieten",open_map:"Karte",legend_bike:"Rad",legend_ebike:"E-Bike",legend_empty:"Freier Platz",legend_overflow:"Überzählig",legend_reserved:"Reserviert",reserved:"Reserviert",legend_disabled:"Ausser Betrieb",disabled:"Ausser Betrieb",battery_unknown:"Batterie unbekannt",version_update:"Nextbike Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",editor:{section_stations:"Stationen",stations_hint:"Eine oder mehrere Stationen anzeigen.",section_display:"Anzeige",layout_label:"Mehrfach-Layout",layout_stacked:"Gestapelt",layout_tabs:"Reiter",show_rack:"Bike-Rack anzeigen",show_legend:"Legende anzeigen",show_battery:"Batterie im E-Bike-Slot anzeigen",show_ebikes:"E-Bike-Anzeige",show_docks:"Plätze anzeigen",show_flags:"Statussymbole anzeigen",show_timestamp:"Zeitstempel anzeigen",show_rent_button:"App-Mietlink anzeigen",hide_attribution:"Datenquelle ausblenden",no_sensors_available:"Keine Nextbike-Sensoren verfügbar. Erst eine Station über Einstellungen → Geräte & Dienste hinzufügen."}}};function me(e){return(e?.language||"en").startsWith("de")?"de":"en"}function ve(e,t){let i=e;for(const e of t){if("object"!=typeof i||null===i)return;const t=i[e];if(void 0===t)return;i=t}return"string"==typeof i?i:void 0}const xe=d`
  :host {
    display: block;
    /* Card responds to its own column width, not the viewport — narrow
       dashboard columns trigger the compact layout even on wide
       screens. Slot size is driven from --nb-slot-size so a single
       custom property can retune the whole rack density.

       Font sizes below are in rem (root-relative, 16px baseline) so the
       user's browser/OS text-size preference reaches the card even when
       the parent ha-card cascades its own inherited size. Padding,
       margin, and gap stay in px. */
    container-type: inline-size;
    container-name: nbcard;
    --nb-slot-size: 16px;
    --nb-slot-height: 18px;
  }
  ha-card {
    overflow: hidden;
  }
  .wrap {
    padding: 12px 16px 10px;
  }
  .banner {
    background: var(--warning-color, #ffa000);
    color: #fff;
    padding: 8px 12px;
    margin: -12px -16px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .banner button {
    background: #fff;
    color: var(--warning-color, #ffa000);
    border: none;
    border-radius: 4px;
    padding: 4px 10px;
    font-weight: 600;
    cursor: pointer;
  }
  .tabs {
    /* .tabs is a direct child of ha-card (not inside .wrap), so it sits
       flush with the card edges and at the very top by default — no
       padding to escape. .wrap's top padding provides the breathing
       room between the tab row and the first station below. */
    display: flex;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab {
    /* Fixed height removes any padding vs. border vs. line-height
       interaction — flex centres the text inside a deterministic
       44px box. Active indicator is a box-shadow (doesn't consume
       layout height) so the text stays truly centred whether or not
       the tab is active. */
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 8px;
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
    /* nowrap + ellipsis is the graceful-degrade pattern for text-spacing
       overrides (WCAG 1.4.12): label clips with "…" rather than pushing
       the tab row into a multi-line layout that would hide other tabs. */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s, box-shadow 0.15s;
  }
  .tab.active {
    /* Three independent cues for the active tab so it reads as active
       under any single-channel deficit (low vision, protanopia,
       grayscale mode): distinct colour, bottom border, and heavier
       weight. */
    color: var(--primary-color);
    font-weight: 700;
    box-shadow: inset 0 -2px 0 var(--primary-color);
  }
  .tab:hover {
    color: var(--primary-text-color);
  }
  .station {
    margin-bottom: 0;
  }
  .station:not(:last-child) {
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
  }
  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .accent {
    width: 4px;
    align-self: stretch;
    border-radius: 2px;
    background: var(--primary-color);
  }
  .title {
    /* <h2> override: nuke UA heading margins + size so the card header
       stays visually identical to the previous <div>. Semantics only. */
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    /* Station names can be long; nowrap + ellipsis keeps the header row
       a fixed height and is the graceful-degrade pattern for WCAG 1.4.12
       text-spacing overrides. */
    white-space: nowrap;
    flex: 1;
  }
  .subtitle {
    /* <p> override: nuke UA paragraph margins. */
    margin: 0;
    font-size: 0.7rem;
    color: var(--secondary-text-color);
    font-weight: 400;
    letter-spacing: 0.2px;
  }
  .header-link {
    color: var(--secondary-text-color);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 0.7rem;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .header-link:hover {
    opacity: 1;
    color: var(--primary-color);
  }
  .header-link ha-icon {
    --mdc-icon-size: 16px;
  }
  .primary {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 6px 0 2px;
  }
  .bikes-num {
    font-size: 2.1rem;
    font-weight: 700;
    line-height: 1;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  .bikes-of {
    font-size: 0.875rem;
    color: var(--secondary-text-color);
    font-weight: 400;
  }
  .bikes-label {
    color: var(--secondary-text-color);
    font-size: 0.85rem;
    margin-left: -6px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    background: color-mix(in srgb, var(--primary-color) 14%, transparent);
    color: var(--primary-color);
  }
  .pill ha-icon {
    --mdc-icon-size: 14px;
  }
  .pill.muted {
    background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
    color: var(--secondary-text-color);
  }
  .pill.ebike {
    background: color-mix(in srgb, #ffd740 28%, transparent);
    color: var(--primary-text-color);
  }
  .pill.ebike ha-icon {
    color: #c28a00;
  }
  .pill-row {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: auto;
    align-self: center;
  }
  .rack {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px;
    margin: 8px 0 4px;
    padding: 6px 8px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--secondary-text-color) 4%, transparent);
  }
  .slot {
    display: block;
    width: var(--nb-slot-size);
    height: var(--nb-slot-height);
    box-sizing: border-box;
    border-radius: 2px;
    flex: 0 0 var(--nb-slot-size);
    line-height: 0;
    padding: 0;
    margin: 0;
  }
  .slot.filled {
    background: var(--primary-color);
  }
  .slot.filled.ebike {
    background: linear-gradient(
      135deg,
      var(--primary-color) 0%,
      var(--primary-color) 55%,
      #ffd740 55%,
      #ffd740 100%
    );
  }
  /* Battery-fill variant: vertical gradient bottom (filled) → top
     (empty). --bat-pct and --bat-color set inline per slot. The empty
     portion is a desaturated version of the same hue so the shape still
     reads as an e-bike slot, with an outline so 0% is visible. */
  .slot.filled.ebike.battery {
    background: linear-gradient(
      to top,
      var(--bat-color, #2ecc71) var(--bat-pct, 0%),
      color-mix(in srgb, var(--bat-color, #2ecc71) 15%, transparent)
        var(--bat-pct, 0%)
    );
    outline: 1px solid
      color-mix(in srgb, var(--bat-color, #2ecc71) 60%, transparent);
    outline-offset: -1px;
  }
  .slot.empty {
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px dashed
      color-mix(in srgb, var(--secondary-text-color) 40%, transparent);
    outline-offset: -1px;
  }
  /* Reserved: bike physically present, held for another user. Solid
     outline + lock icon so it reads against both empty (dashed) and
     filled (solid) neighbours. */
  .slot.reserved {
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px solid
      color-mix(in srgb, var(--secondary-text-color) 55%, transparent);
    outline-offset: -1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
  }
  .slot.reserved ha-icon {
    --mdc-icon-size: 10px;
  }
  .legend-swatch.reserved {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px solid
      color-mix(in srgb, var(--secondary-text-color) 55%, transparent);
    outline-offset: -1px;
    color: var(--secondary-text-color);
  }
  .legend-swatch.reserved ha-icon {
    --mdc-icon-size: 9px;
  }
  /* Disabled: broken / out of service. Amber tint + wrench icon —
     different enough from reserved (neutral grey lock) that the concepts
     don't blur together at a glance. */
  .slot.disabled {
    background: color-mix(in srgb, #ffa726 14%, transparent);
    outline: 1px solid color-mix(in srgb, #ffa726 65%, transparent);
    outline-offset: -1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #e65100;
  }
  .slot.disabled ha-icon {
    --mdc-icon-size: 10px;
  }
  .legend-swatch.disabled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, #ffa726 14%, transparent);
    outline: 1px solid color-mix(in srgb, #ffa726 65%, transparent);
    outline-offset: -1px;
    color: #e65100;
  }
  .legend-swatch.disabled ha-icon {
    --mdc-icon-size: 9px;
  }
  .rack-note {
    font-size: 0.65rem;
    line-height: 18px;
    color: var(--secondary-text-color);
    margin-left: 6px;
    flex-shrink: 0;
  }
  .legend {
    /* <dl> override: nuke UA dl margins so the legend stays tight.
       Keeps the flex layout used when this was a <div>. */
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin: 0 0 6px;
    padding: 0 2px;
    font-size: 0.65rem;
    color: var(--secondary-text-color);
    /* Translated legend labels can be long (DE "Außer Betrieb" etc.) —
       allow wrapping so WCAG 1.4.12 text-spacing overrides don't clip. */
    overflow-wrap: anywhere;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .legend dd {
    /* <dd> default has margin-inline-start: 40px — reset so the label
       sits right next to its swatch. */
    margin: 0;
  }
  .legend-swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    box-sizing: border-box;
    border-radius: 2px;
    flex: 0 0 12px;
    line-height: 0;
    padding: 0;
    margin: 0;
    vertical-align: middle;
  }
  .legend-swatch.empty {
    background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
    outline: 1px dashed
      color-mix(in srgb, var(--secondary-text-color) 40%, transparent);
    outline-offset: -1px;
  }
  .legend-overflow {
    /* <dt> override: block-level by default; match the swatch inline
       presentation so the legend flex row reads cleanly. */
    display: inline-flex;
    align-items: center;
    padding: 0 4px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--secondary-text-color) 10%, transparent);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
  .flags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.72rem;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }
  .flag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .flag ha-icon {
    --mdc-icon-size: 14px;
  }
  .flag.warn {
    color: var(--warning-color, #ffa000);
  }
  .flag.err {
    color: var(--error-color, #db4437);
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 10px;
    margin-top: 10px;
    font-size: 0.7rem;
    color: var(--secondary-text-color);
  }
  .footer a.rent {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .footer a.rent:hover {
    text-decoration: underline;
  }
  .footer ha-icon {
    --mdc-icon-size: 14px;
  }
  .attr {
    margin-top: 8px;
    font-size: 0.65rem;
    color: var(--secondary-text-color);
    text-align: center;
    opacity: 0.7;
  }
  .empty-state {
    padding: 20px 0;
    text-align: center;
    color: var(--secondary-text-color);
  }

  /* Narrow-card layout: shrink the rack density and wrap the pill row
     below the bike count so 40+ docks still fit on a one-column phone
     dashboard. Card columns wider than 440px get larger slots instead
     — dashboards placing the card in a wide sidebar no longer look
     pixel-tiny. */
  @container nbcard (inline-size < 360px) {
    :host {
      --nb-slot-size: 14px;
      --nb-slot-height: 16px;
    }
    .wrap {
      padding: 10px 12px 8px;
    }
    .banner {
      margin: -10px -12px 10px;
    }
    .primary {
      flex-wrap: wrap;
    }
    .pill-row {
      flex-basis: 100%;
    }
  }
  @container nbcard (inline-size > 440px) {
    :host {
      --nb-slot-size: 20px;
      --nb-slot-height: 22px;
    }
  }

  /* Accessibility: visible focus ring for keyboard users. */
  .tab:focus-visible,
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 6px;
  }

  /* Forced-colors (Windows High Contrast) fallback: var(--primary-color)
     may resolve to a low-contrast system colour, so switch to the
     CanvasText keyword which is guaranteed to contrast with Canvas. */
  @media (forced-colors: active) {
    .tab:focus-visible,
    a:focus-visible,
    button:focus-visible {
      outline-color: CanvasText;
    }
  }

  /* Accessibility: honour user motion preference. */
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
`;function $e(e){return e&&e.states?Object.keys(e.states).filter(t=>{if(!t.startsWith("sensor."))return!1;const i=e.states[t].attributes;return!!i&&"string"==typeof i.station_id&&"string"==typeof i.system_id&&i.system_id.startsWith("nextbike_")&&"string"==typeof i.attribution&&i.attribution.startsWith("Data: nextbike")}):[]}function we(e){return"string"==typeof e?e.includes(".")?{entity:e}:null:e&&"object"==typeof e&&"string"==typeof e.entity?{entity:e.entity}:null}function ke(e){const t={...e||{}};"string"==typeof t.entity&&t.entity.includes(".")&&(Array.isArray(t.entities)&&0!==t.entities.length||(t.entities=[{entity:t.entity}])),delete t.entity;const i=Array.isArray(t.entities)?t.entities:[];return t.entities=i.map(we).filter(e=>null!==e),t.show_rack=!1!==t.show_rack,t.show_legend=!1!==t.show_legend,t.show_ebikes=!1!==t.show_ebikes,t.show_battery=!1!==t.show_battery,t.show_docks=!1!==t.show_docks,t.show_flags=!1!==t.show_flags,t.show_timestamp=!1!==t.show_timestamp,t.show_rent_button=!1!==t.show_rent_button,t.hide_attribution=!0===t.hide_attribution,"tabs"!==t.layout&&(t.layout="stacked"),t}function Ae(e){return"number"==typeof e&&Number.isFinite(e)?e>=75?"#2ecc71":e>=50?"#8bc34a":e>=25?"#ffa726":"#e53935":"#2ecc71"}function Se(e){return String(e).replace(/\s+(Bikes available|Räder verfügbar)$/,"")}const Ee=d`
  :host {
    display: block;
  }
  .editor {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .editor-section {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .section-header {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .editor-hint {
    font-size: 12px;
    color: var(--secondary-text-color);
    line-height: 1.4;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
  }
  .chip.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
  .chip:hover {
    opacity: 0.85;
  }
  .chip .stop-name {
    font-weight: 500;
  }
  .chip .eid {
    font-size: 11px;
    opacity: 0.7;
  }
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .toggle-row label {
    font-size: 13px;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  /* Visual "these toggles depend on the row above" cue — left border and
     indent mark the sub-toggles as children of show_rack. Container
     disappears entirely when the parent is off; no ghost row. */
  .sub-toggles {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 12px;
    border-left: 2px solid var(--divider-color, rgba(0,0,0,0.12));
    margin-left: 4px;
  }
  .layout-buttons {
    display: inline-flex;
    gap: 4px;
  }
  .layout-buttons button {
    padding: 4px 12px;
    border-radius: 14px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    font-size: 13px;
    cursor: pointer;
  }
  .layout-buttons button.active {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
`;let Ce=class extends he{constructor(){super(...arguments),this._config={type:"nextbike-austria-card",entities:[]},this._toggleStation=e=>{const t=[...this._config.entities||[]],i=t.findIndex(t=>t.entity===e),s=i>=0?t.filter((e,t)=>t!==i):[...t,{entity:e}];this._config={...this._config,entities:s},this._fire()},this._setBool=(e,t)=>{this._config={...this._config,[e]:t},this._fire()},this._setLayout=e=>{"stacked"!==e&&"tabs"!==e||(this._config={...this._config,layout:e},this._fire())}}static{this.styles=Ee}setConfig(e){this._config=ke(e)}_et(e){return function(e,t){const i=me(e);return ve(ye[i],["editor",t])??ve(ye.en,["editor",t])??t}(this.hass,e)}_fire(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:{...this._config}},bubbles:!0,composed:!0}))}render(){if(!this.hass)return Z;const e=$e(this.hass),t=this._config.entities||[],i=new Set(t.map(e=>e.entity)),s="tabs"===this._config.layout?"tabs":"stacked",r=!1!==this._config.show_rack;return q`
      <div class="editor">
        <div class="editor-section">
          <div class="section-header">${this._et("section_stations")}</div>
          <div class="editor-hint">${this._et("stations_hint")}</div>
          <div class="chips">
            ${e.length?e.map(e=>this._renderStationChip(e,i)):q`<div class="editor-hint">${this._et("no_sensors_available")}</div>`}
          </div>
        </div>

        <div class="editor-section">
          <div class="section-header">${this._et("section_display")}</div>
          <div class="toggle-row">
            <span style="font-size:13px;">${this._et("layout_label")}</span>
            <div class="layout-buttons">
              <button
                type="button"
                class=${"stacked"===s?"active":""}
                @click=${()=>this._setLayout("stacked")}
              >
                ${this._et("layout_stacked")}
              </button>
              <button
                type="button"
                class=${"tabs"===s?"active":""}
                @click=${()=>this._setLayout("tabs")}
              >
                ${this._et("layout_tabs")}
              </button>
            </div>
          </div>
          ${this._renderToggle("show_rack")}
          ${r?q`
                <div class="sub-toggles">
                  ${this._renderToggle("show_legend")}
                  ${this._renderToggle("show_battery")}
                </div>
              `:Z}
          ${this._renderToggle("show_ebikes")}
          ${this._renderToggle("show_docks")}
          ${this._renderToggle("show_flags")}
          ${this._renderToggle("show_timestamp")}
          ${this._renderToggle("show_rent_button")}
          ${this._renderHideAttribution()}
        </div>
      </div>
    `}_renderStationChip(e,t){const i=this.hass?.states[e]?.attributes,s=Se(i?.friendly_name||e),r=t.has(e);return q`
      <button
        type="button"
        class="chip ${r?"selected":""}"
        @click=${()=>this._toggleStation(e)}
      >
        <span class="stop-name">${s}</span>
        <span class="eid">${e.split(".")[1]||e}</span>
      </button>
    `}_renderToggle(e){const t=`nb-toggle-${e}`,i=!1!==this._config[e];return q`
      <div class="toggle-row">
        <label for=${t}>${this._et(e)}</label>
        <ha-switch
          id=${t}
          ?checked=${i}
          @change=${t=>this._setBool(e,t.target.checked)}
        ></ha-switch>
      </div>
    `}_renderHideAttribution(){const e=!0===this._config.hide_attribution;return q`
      <div class="toggle-row">
        <label for="nb-toggle-hide_attribution">
          ${this._et("hide_attribution")}
        </label>
        <ha-switch
          id="nb-toggle-hide_attribution"
          ?checked=${e}
          @change=${e=>this._setBool("hide_attribution",e.target.checked)}
        ></ha-switch>
      </div>
    `}};r([_e({attribute:!1})],Ce.prototype,"hass",void 0),r([fe()],Ce.prototype,"_config",void 0),Ce=r([ue("nextbike-austria-card-editor")],Ce);let Te=class extends he{constructor(){super(...arguments),this._config={type:"nextbike-austria-card",entities:[]},this._activeTab=0,this._versionMismatch=null,this._tickKey=0,this._tickTimer=null,this._versionChecked=!1}static{this.styles=xe}setConfig(e){if(null===e||"object"!=typeof e||Array.isArray(e))throw new Error("nextbike-austria-card: config must be an object");this._config=ke(e)}connectedCallback(){super.connectedCallback(),this._tickTimer||(this._tickTimer=setInterval(()=>{this._tickKey++},6e4))}disconnectedCallback(){super.disconnectedCallback(),this._tickTimer&&(clearInterval(this._tickTimer),this._tickTimer=null)}willUpdate(e){e.has("hass")&&this.hass&&!this._versionChecked&&(this._versionChecked=!0,this._checkCardVersion())}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_activeTab")||e.has("_versionMismatch")||e.has("_tickKey"))return!0;if(!e.has("hass"))return!1;const t=e.get("hass");if(!t)return!0;if(!this.hass)return!1;return this._resolveEntities(this.hass).some(e=>t.states[e.entity]!==this.hass.states[e.entity])}getCardSize(){const e=(this._config?.entities||[]).length||1;return Math.min(12,3+3*e)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static async getConfigElement(){return document.createElement("nextbike-austria-card-editor")}static getStubConfig(e){const t=$e(e);return{entities:t.length?[{entity:t[0]}]:[]}}async _checkCardVersion(){if(this.hass?.callWS)try{const t=await this.hass.callWS({type:"nextbike_austria/card_version"});t?.version&&t.version!==e&&(this._versionMismatch=t.version)}catch{}}_t(e){return function(e,t){const i=me(e);return ve(ye[i],[t])??ve(ye.en,[t])??t}(this.hass,e)}_resolveEntities(e=this.hass){const t=Array.isArray(this._config?.entities)?this._config.entities.filter(t=>e?.states[t.entity]):[];if(t.length)return t;const i=$e(e);return i.length?[{entity:i[0]}]:[]}render(){if(!this.hass||!this._config)return Z;const e=this._resolveEntities(),t="tabs"===this._config.layout&&e.length>=2;t&&this._activeTab>=e.length&&(this._activeTab=0);const i=e.map(e=>this.hass?.states[e.entity]?.attributes?.attribution).find(e=>"string"==typeof e&&e.length>0)||"Data: nextbike GmbH, CC0-1.0";let s;return s=e.length?t?this._renderStation(e[this._activeTab]):e.map(e=>this._renderStation(e)):this._renderEmpty(),q`
      <ha-card>
        ${t?this._renderTabs(e):Z}
        <div class="wrap">
          ${this._versionMismatch?this._renderBanner():Z}
          ${s}
          ${this._config.hide_attribution?Z:q`<div class="attr">${i}</div>`}
        </div>
      </ha-card>
    `}_renderBanner(){const e=this._t("version_update").replace("{v}",this._versionMismatch||"?");return q`
      <div class="banner" role="alert" aria-live="assertive">
        <span>${e}</span>
        <button
          type="button"
          aria-label=${this._t("version_reload")}
          @click=${()=>window.location.reload()}
        >
          ${this._t("version_reload")}
        </button>
      </div>
    `}_renderEmpty(){const e=$e(this.hass).length?"no_entities_picked":"no_entities_available";return q`<div class="empty-state">${this._t(e)}</div>`}_renderTabs(e){return q`
      <div class="tabs" role="tablist">
        ${e.map((t,i)=>{const s=this.hass?.states[t.entity]?.attributes||{},r="string"==typeof s.friendly_name&&s.friendly_name.length>0,n=Se(s.friendly_name||t.entity),o=i===this._activeTab;return q`
            <button
              type="button"
              role="tab"
              class="tab ${o?"active":""}"
              aria-selected=${o?"true":"false"}
              tabindex=${o?"0":"-1"}
              @click=${()=>this._setActiveTab(i)}
              @keydown=${t=>this._onTabKeydown(t,i,e.length)}
            >
              ${r?q`<span lang="de">${n}</span>`:n}
            </button>
          `})}
      </div>
    `}_setActiveTab(e){Number.isFinite(e)&&e!==this._activeTab&&(this._activeTab=e)}_onTabKeydown(e,t,i){let s=t;switch(e.key){case"ArrowRight":s=(t+1)%i;break;case"ArrowLeft":s=(t-1+i)%i;break;case"Home":s=0;break;case"End":s=i-1;break;default:return}e.preventDefault(),this._setActiveTab(s),this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelectorAll('.tabs [role="tab"]');e?.[s]?.focus()})}_renderStation(e){const r=this.hass?.states[e.entity];if(!r)return q`<div class="empty-state">${this._t("no_entities_unavailable")}</div>`;const n=r.attributes||{},o=Number.isFinite(parseInt(r.state,10))?parseInt(r.state,10):0,a="number"==typeof n.capacity?n.capacity:null,l="number"==typeof n.num_docks_available?n.num_docks_available:null,c=function(e){const t=e?.vehicle_types_available;if(!Array.isArray(t))return null;let i=0;for(const e of t){if(!e||"object"!=typeof e)continue;const t=e,r=String(t.vehicle_type_id??""),n=t.count;s.has(r)&&"number"==typeof n&&Number.isFinite(n)&&(i+=n)}return i}(n),d="number"==typeof n.e_bike_avg_battery_pct?n.e_bike_avg_battery_pct:null,h="number"==typeof n.e_bike_range_samples?n.e_bike_range_samples:0,p=Array.isArray(n.e_bike_battery_list)?n.e_bike_battery_list:null,u=n.vehicle_type_names&&"object"==typeof n.vehicle_type_names?n.vehicle_type_names:{},b=Array.isArray(n.vehicle_types_available)?n.vehicle_types_available:[],g="number"==typeof n.bikes_reserved?n.bikes_reserved:0,_=Array.isArray(n.bikes_reserved_types)?n.bikes_reserved_types:[],f="number"==typeof n.bikes_disabled?n.bikes_disabled:0,y=Array.isArray(n.bikes_disabled_types)?n.bikes_disabled_types:[],m=n.system_id||"",v=t[m]||"var(--primary-color)",x=i[m]||m.replace(/^nextbike_/,""),$="string"==typeof n.rental_uri?n.rental_uri:"",w="string"==typeof n.friendly_name&&n.friendly_name.length>0,k=Se(n.friendly_name||e.entity),A="number"==typeof n.latitude&&"number"==typeof n.longitude?`https://www.google.com/maps/search/?api=1&query=${n.latitude},${n.longitude}`:null,S=1===o?this._t("bike"):this._t("bikes");return q`
      <section class="station" aria-label=${k}>
        <header class="header">
          <div class="accent" aria-hidden="true" style=${`background:${v}`}></div>
          <div style="min-width:0;flex:1;">
            <h2 class="title">
              ${w?q`<span lang="de">${k}</span>`:k}
            </h2>
            <p class="subtitle">${x}</p>
          </div>
          ${A?q`
                <a
                  class="header-link"
                  href=${A}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label=${`${this._t("open_map")}: ${k}`}
                  title=${this._t("open_map")}
                >
                  <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>${this._t("open_map")}
                </a>
              `:Z}
        </header>

        <div class="primary">
          <span class="bikes-num">${o}</span>
          ${null!==a?q`<span class="bikes-of">/ ${a}</span>`:Z}
          <span class="bikes-label">${S}</span>
          <span class="pill-row">${this._renderPills(c,l,a)}</span>
        </div>

        ${this._config.show_rack&&null!==a&&a>0?this._renderRack({bikes:o,ebikes:c,capacity:a,accent:v,batteryPct:d,batterySamples:h,batteryList:p,vehicleTypesAvailable:b,vehicleTypeNames:u,reservedCount:g,reservedTypes:_,disabledCount:f,disabledTypes:y}):Z}

        ${this._config.show_flags?this._renderFlags(n):Z}
        ${this._renderFooter(n,$)}
      </section>
    `}_renderPills(e,t,i){const s=[];if(this._config.show_ebikes&&"number"==typeof e&&Number.isFinite(e)&&e>0&&s.push(q`
        <span class="pill ebike">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon>${e}
          ${this._t("ebikes")}
        </span>
      `),this._config.show_docks&&null!==t&&null!==i){const e=1===t?this._t("dock"):this._t("docks");s.push(q`
        <span class="pill muted">
          <ha-icon icon="mdi:parking"></ha-icon>${t} ${e}
        </span>
      `)}return s}_renderRack(e){const{bikes:t,ebikes:i,capacity:r,accent:n,batteryPct:o,batterySamples:a,batteryList:l,vehicleTypesAvailable:c,vehicleTypeNames:d,reservedCount:h,reservedTypes:p,disabledCount:u,disabledTypes:b}=e,g=r,_=Math.min(t,r),f=Math.min(Number.isFinite(h)?h:0,Math.max(0,g-_)),y=Math.min(Number.isFinite(u)?u:0,Math.max(0,g-_-f)),m="number"==typeof i&&Number.isFinite(i)&&i>0,v=m?Math.min(_,i):0,x=!!this._config.show_battery&&"number"==typeof o&&a>0,$=x&&Array.isArray(l)?l:[],w=function(e,t){if(!Array.isArray(e))return null;for(const i of e){const e=String(i?.vehicle_type_id??"");if(s.has(e)&&t?.[e])return t[e]}return null}(c,d),k=function(e,t){const i=[];if(!Array.isArray(e))return i;for(const r of e){const e=String(r?.vehicle_type_id??""),n="number"==typeof r?.count&&Number.isFinite(r.count)?r.count:0;if(s.has(e)||n<=0)continue;const o=t?.[e]||"";for(let e=0;e<n;e++)i.push(o)}return i}(c,d);let A=0;const S=[];for(let e=0;e<_;e++){if(e<v){const t=$[e]||null,i=t?.type||w||this._t("legend_ebike");if(t&&x&&"number"==typeof t.pct){const e=t.pct,s=Ae(e),r=`${i} · ${Math.round(e)}%`;S.push(q`
            <div
              class="slot filled ebike battery"
              role="img"
              aria-label=${r}
              style=${`--bat-pct:${e}%;--bat-color:${s};`}
              title=${r}
            ></div>
          `)}else{const e=x?`${i} · ${this._t("battery_unknown")}`:i;S.push(q`
            <div
              class="slot filled ebike"
              role="img"
              aria-label=${e}
              style=${`background:linear-gradient(135deg, ${n} 0%, ${n} 55%, #ffd740 55%, #ffd740 100%);`}
              title=${e}
            ></div>
          `)}}else{const e=k[A++]||this._t("legend_bike");S.push(q`
          <div
            class="slot filled"
            role="img"
            aria-label=${e}
            style=${`background:${n};`}
            title=${e}
          ></div>
        `)}}const E=this._t("reserved");for(let e=0;e<f;e++){const t=p?.[e],i=t?`${t} · ${E}`:E;S.push(q`
        <div
          class="slot reserved"
          role="img"
          aria-label=${i}
          title=${i}
        >
          <ha-icon icon="mdi:lock" aria-hidden="true"></ha-icon>
        </div>
      `)}const C=this._t("disabled");for(let e=0;e<y;e++){const t=b?.[e],i=t?`${t} · ${C}`:C;S.push(q`
        <div
          class="slot disabled"
          role="img"
          aria-label=${i}
          title=${i}
        >
          <ha-icon icon="mdi:wrench" aria-hidden="true"></ha-icon>
        </div>
      `)}for(let e=_+f+y;e<g;e++){const e=this._t("legend_empty");S.push(q`
        <div
          class="slot empty"
          role="img"
          aria-label=${e}
          title=${e}
        ></div>
      `)}const T=t>r,z=_+f+y<g,P=f>0,M=y>0,R=this._t("rack_summary").replace("{available}",String(_)).replace("{capacity}",String(r));return q`
      <div class="rack" role="group" aria-label=${R}>
        ${S}
        ${T?q`<span class="rack-note" aria-label=${"+"+(t-r)}>+${t-r}</span>`:Z}
      </div>
      ${this._config.show_legend?this._renderLegend({accent:n,hasEbikes:m,hasOverflow:T,hasEmptyVisible:z,battery:x&&"number"==typeof o?{pct:o,color:Ae(o)}:null,hasReservedVisible:P,hasDisabledVisible:M}):Z}
    `}_renderLegend(e){const{accent:t,hasEbikes:i,hasOverflow:s,hasEmptyVisible:r,battery:n,hasReservedVisible:o,hasDisabledVisible:a}=e,l=[q`
        <div class="legend-item">
          <dt class="legend-swatch" style=${`background:${t}`} aria-hidden="true"></dt>
          <dd>${this._t("legend_bike")}</dd>
        </div>
      `];if(i){const e=n?"background:linear-gradient(to top, #2ecc71 70%, color-mix(in srgb, #2ecc71 15%, transparent) 70%);outline:1px solid color-mix(in srgb, #2ecc71 60%, transparent);outline-offset:-1px;":`background:linear-gradient(135deg, ${t} 0%, ${t} 55%, #ffd740 55%, #ffd740 100%);`;l.push(q`
        <div class="legend-item">
          <dt class="legend-swatch" style=${e} aria-hidden="true"></dt>
          <dd>${this._t("legend_ebike")}</dd>
        </div>
      `)}return o&&l.push(q`
        <div class="legend-item">
          <dt class="legend-swatch reserved" aria-hidden="true">
            <ha-icon icon="mdi:lock"></ha-icon>
          </dt>
          <dd>${this._t("legend_reserved")}</dd>
        </div>
      `),a&&l.push(q`
        <div class="legend-item">
          <dt class="legend-swatch disabled" aria-hidden="true">
            <ha-icon icon="mdi:wrench"></ha-icon>
          </dt>
          <dd>${this._t("legend_disabled")}</dd>
        </div>
      `),r&&l.push(q`
        <div class="legend-item">
          <dt class="legend-swatch empty" aria-hidden="true"></dt>
          <dd>${this._t("legend_empty")}</dd>
        </div>
      `),s&&l.push(q`
        <div class="legend-item">
          <dt class="legend-overflow" aria-hidden="true">+N</dt>
          <dd>${this._t("legend_overflow")}</dd>
        </div>
      `),q`<dl class="legend">${l}</dl>`}_renderFlags(e){const t=[];return!1===e.is_installed&&t.push(q`
        <span class="flag err">
          <ha-icon icon="mdi:alert-circle"></ha-icon>${this._t("offline")}
        </span>
      `),!1===e.is_renting&&t.push(q`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t("no_rental")}
        </span>
      `),!1===e.is_returning&&t.push(q`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t("no_return")}
        </span>
      `),!0===e.is_virtual_station&&t.push(q`
        <span class="flag">
          <ha-icon icon="mdi:map-marker-radius"></ha-icon>${this._t("virtual_station")}
        </span>
      `),t.length?q`<div class="flags">${t}</div>`:Z}_renderFooter(e,t){const i=[];if(this._config.show_rent_button&&t&&i.push(q`
        <a class="rent" href=${t} target="_blank" rel="noopener noreferrer">
          <ha-icon icon="mdi:cellphone-arrow-down"></ha-icon>${this._t("rent_in_app")}
        </a>
      `),this._config.show_timestamp){const t=function(e,t){if("number"!=typeof e||!Number.isFinite(e))return null;const i=Math.max(0,Math.floor(Date.now()/1e3-e));return i<10?t("now"):i<60?t("seconds_ago").replace("{n}",String(i)):i<3600?t("minutes_ago").replace("{n}",String(Math.floor(i/60))):t("hours_ago").replace("{n}",String(Math.floor(i/3600)))}(e.last_reported,e=>this._t(e));t&&i.push(q`<span>${this._t("last_updated")} ${t}</span>`)}return i.length?q`<div class="footer">${i}</div>`:Z}};r([_e({attribute:!1})],Te.prototype,"hass",void 0),r([fe()],Te.prototype,"_config",void 0),r([fe()],Te.prototype,"_activeTab",void 0),r([fe()],Te.prototype,"_versionMismatch",void 0),r([fe()],Te.prototype,"_tickKey",void 0),Te=r([ue("nextbike-austria-card")],Te);const ze=window;ze.customCards=ze.customCards||[],ze.customCards.push({type:"nextbike-austria-card",name:"Nextbike Austria Card",description:"Station dashboard for nextbike-operated bike-sharing in Austria — bikes, docks, e-bikes, rental deep-link.",preview:!0,documentationURL:"https://github.com/rolandzeiner/nextbike-austria"}),console.info(`%c  NEXTBIKE-AUSTRIA-CARD  %c  v${e}  `,"color: #DC2026; font-weight: bold; background: black","color: white; background: dimgray");
