// Nextbike Austria Card — bundled by Rollup. Edit sources in src/, then `npm run build`.
const e="1.2.0-beta.1",t={nextbike_wr:"#DC2026",nextbike_la:"#004E9E",nextbike_si:"#C8102E",nextbike_vt:"#009D58",nextbike_al:"#E30613",nextbike_ka:"#FFC20E"},i=new Set(["143","183","200"]);function s(e,t,i,s){var r,n=arguments.length,a=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const r=globalThis,n=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),o=new WeakMap;let l=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(n&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}};const c=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new l(i,e,a)},d=n?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new l("string"==typeof e?e:e+"",void 0,a))(t)})(e):e,{is:h,defineProperty:p,getOwnPropertyDescriptor:u,getOwnPropertyNames:b,getOwnPropertySymbols:g,getPrototypeOf:f}=Object,_=globalThis,m=_.trustedTypes,v=m?m.emptyScript:"",y=_.reactiveElementPolyfillSupport,x=(e,t)=>e,$={toAttribute(e,t){switch(t){case Boolean:e=e?v:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},w=(e,t)=>!h(e,t),k={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:w};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let A=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=k){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&p(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=u(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const n=s?.call(this);r?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??k}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const e=f(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const e=this.properties,t=[...b(e),...g(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(d(e))}else void 0!==e&&t.push(d(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(n)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of t){const t=document.createElement("style"),s=r.litNonce;void 0!==s&&t.setAttribute("nonce",s),t.textContent=i.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:$;this._$Em=s;const n=r.fromAttribute(t,e.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(void 0!==e){const n=this.constructor;if(!1===s&&(r=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??w)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==r||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[x("elementProperties")]=new Map,A[x("finalized")]=new Map,y?.({ReactiveElement:A}),(_.reactiveElementVersions??=[]).push("2.1.2");const S=globalThis,E=e=>e,C=S.trustedTypes,z=C?C.createPolicy("lit-html",{createHTML:e=>e}):void 0,T="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,H="?"+P,R=`<${H}>`,M=document,N=()=>M.createComment(""),O=e=>null===e||"object"!=typeof e&&"function"!=typeof e,U=Array.isArray,j="[ \t\n\f\r]",B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,L=/>/g,F=RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),W=/'/g,I=/"/g,V=/^(?:script|style|textarea|title)$/i,K=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),q=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),Z=new WeakMap,J=M.createTreeWalker(M,129);function X(e,t){if(!U(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==z?z.createHTML(t):t}const Y=(e,t)=>{const i=e.length-1,s=[];let r,n=2===t?"<svg>":3===t?"<math>":"",a=B;for(let t=0;t<i;t++){const i=e[t];let o,l,c=-1,d=0;for(;d<i.length&&(a.lastIndex=d,l=a.exec(i),null!==l);)d=a.lastIndex,a===B?"!--"===l[1]?a=D:void 0!==l[1]?a=L:void 0!==l[2]?(V.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=F):void 0!==l[3]&&(a=F):a===F?">"===l[0]?(a=r??B,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,o=l[1],a=void 0===l[3]?F:'"'===l[3]?I:W):a===I||a===W?a=F:a===D||a===L?a=B:(a=F,r=void 0);const h=a===F&&e[t+1].startsWith("/>")?" ":"";n+=a===B?i+R:c>=0?(s.push(o),i.slice(0,c)+T+i.slice(c)+P+h):i+P+(-2===c?t:h)}return[X(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class Q{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,n=0;const a=e.length-1,o=this.parts,[l,c]=Y(e,t);if(this.el=Q.createElement(l,i),J.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=J.nextNode())&&o.length<a;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(T)){const t=c[n++],i=s.getAttribute(e).split(P),a=/([.?@])?(.*)/.exec(t);o.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?re:"?"===a[1]?ne:"@"===a[1]?ae:se}),s.removeAttribute(e)}else e.startsWith(P)&&(o.push({type:6,index:r}),s.removeAttribute(e));if(V.test(s.tagName)){const e=s.textContent.split(P),t=e.length-1;if(t>0){s.textContent=C?C.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],N()),J.nextNode(),o.push({type:2,index:++r});s.append(e[t],N())}}}else if(8===s.nodeType)if(s.data===H)o.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(P,e+1));)o.push({type:7,index:r}),e+=P.length-1}r++}}static createElement(e,t){const i=M.createElement("template");return i.innerHTML=e,i}}function ee(e,t,i=e,s){if(t===q)return t;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const n=O(t)?void 0:t._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(e),r._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(t=ee(e,r._$AS(e,t.values),r,s)),t}class te{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??M).importNode(t,!0);J.currentNode=s;let r=J.nextNode(),n=0,a=0,o=i[0];for(;void 0!==o;){if(n===o.index){let t;2===o.type?t=new ie(r,r.nextSibling,this,e):1===o.type?t=new o.ctor(r,o.name,o.strings,this,e):6===o.type&&(t=new oe(r,this,e)),this._$AV.push(t),o=i[++a]}n!==o?.index&&(r=J.nextNode(),n++)}return J.currentNode=M,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ie{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ee(this,e,t),O(e)?e===G||null==e||""===e?(this._$AH!==G&&this._$AR(),this._$AH=G):e!==this._$AH&&e!==q&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>U(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==G&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Q.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new te(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=Z.get(e.strings);return void 0===t&&Z.set(e.strings,t=new Q(e)),t}k(e){U(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new ie(this.O(N()),this.O(N()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=E(e).nextSibling;E(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class se{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=G,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(e,t=this,i,s){const r=this.strings;let n=!1;if(void 0===r)e=ee(this,e,t,0),n=!O(e)||e!==this._$AH&&e!==q,n&&(this._$AH=e);else{const s=e;let a,o;for(e=r[0],a=0;a<r.length-1;a++)o=ee(this,s[i+a],t,a),o===q&&(o=this._$AH[a]),n||=!O(o)||o!==this._$AH[a],o===G?e=G:e!==G&&(e+=(o??"")+r[a+1]),this._$AH[a]=o}n&&!s&&this.j(e)}j(e){e===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class re extends se{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===G?void 0:e}}class ne extends se{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==G)}}class ae extends se{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=ee(this,e,t,0)??G)===q)return;const i=this._$AH,s=e===G&&i!==G||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==G&&(i===G||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ee(this,e)}}const le=S.litHtmlPolyfillSupport;le?.(Q,ie),(S.litHtmlVersions??=[]).push("3.3.2");const ce=globalThis;class de extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let r=s._$litPart$;if(void 0===r){const e=i?.renderBefore??null;s._$litPart$=r=new ie(t.insertBefore(N(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}de._$litElement$=!0,de.finalized=!0,ce.litElementHydrateSupport?.({LitElement:de});const he=ce.litElementPolyfillSupport;he?.({LitElement:de}),(ce.litElementVersions??=[]).push("4.2.2");const pe=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ue={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:w},be=(e=ue,t,i)=>{const{kind:s,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,r,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];t.call(this,i),this.requestUpdate(s,r,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ge(e){return(t,i)=>"object"==typeof i?be(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function fe(e){return ge({...e,state:!0,attribute:!1})}const _e={en:{no_entities_picked:"No station selected",no_entities_available:"No nextbike sensors found",no_entities_unavailable:"Selected station is currently unavailable",rack_summary:"Bike rack: {available} of {capacity} bikes available",offline:"offline",no_rental:"no rental",no_return:"no return",virtual_station:"virtual station",bikes:"bikes",bike:"bike",docks:"docks",dock:"dock",ebikes:"e-bikes",capacity:"capacity",last_updated:"updated",now:"just now",seconds_ago:"{n}s ago",minutes_ago:"{n}min ago",hours_ago:"{n}h ago",rent_in_app:"Rent in app",open_map:"Map",legend_bike:"Bike",legend_ebike:"E-bike",legend_empty:"Empty dock",legend_overflow:"Overflow",legend_reserved:"Reserved",reserved:"Reserved",legend_disabled:"Out of service",disabled:"Out of service",battery_unknown:"battery unknown",version_update:"Nextbike Austria updated to v{v} — please reload",version_reload:"Reload",editor:{section_stations:"Stations",stations_hint:"Show one or more stations.",section_display:"Display",layout_label:"Multi-station layout",layout_stacked:"Stacked",layout_tabs:"Tabs",show_rack:"Show bike rack",show_legend:"Show legend",show_battery:"Show battery in e-bike slot",show_ebikes:"Show e-bikes",show_docks:"Show docks",show_flags:"Show status flags",show_timestamp:"Show timestamp",show_rent_button:"Show app-rent link",hide_header:"Hide header",hide_attribution:"Hide attribution",no_sensors_available:"No nextbike sensors available. Add a station first via Settings → Devices & Services."}},de:{no_entities_picked:"Keine Station ausgewählt",no_entities_available:"Keine Nextbike-Sensoren gefunden",no_entities_unavailable:"Ausgewählte Station ist gerade nicht verfügbar",rack_summary:"Radständer: {available} von {capacity} Rädern verfügbar",offline:"offline",no_rental:"keine Ausleihe",no_return:"keine Rückgabe",virtual_station:"virtuelle Station",bikes:"Räder",bike:"Rad",docks:"Plätze",dock:"Platz",ebikes:"E-Bikes",capacity:"Kapazität",last_updated:"aktualisiert",now:"gerade eben",seconds_ago:"vor {n}s",minutes_ago:"vor {n}min",hours_ago:"vor {n}h",rent_in_app:"In App mieten",open_map:"Karte",legend_bike:"Rad",legend_ebike:"E-Bike",legend_empty:"Freier Platz",legend_overflow:"Überzählig",legend_reserved:"Reserviert",reserved:"Reserviert",legend_disabled:"Außer Betrieb",disabled:"Außer Betrieb",battery_unknown:"Batterie unbekannt",version_update:"Nextbike Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",editor:{section_stations:"Stationen",stations_hint:"Eine oder mehrere Stationen anzeigen.",section_display:"Anzeige",layout_label:"Mehrfach-Layout",layout_stacked:"Gestapelt",layout_tabs:"Reiter",show_rack:"Bike-Rack anzeigen",show_legend:"Legende anzeigen",show_battery:"Batterie im E-Bike-Slot anzeigen",show_ebikes:"E-Bike-Anzeige",show_docks:"Plätze anzeigen",show_flags:"Statussymbole anzeigen",show_timestamp:"Zeitstempel anzeigen",show_rent_button:"App-Mietlink anzeigen",hide_header:"Kopfzeile ausblenden",hide_attribution:"Datenquelle ausblenden",no_sensors_available:"Keine Nextbike-Sensoren verfügbar. Erst eine Station über Einstellungen → Geräte & Dienste hinzufügen."}}},me=_e.en??{};function ve(e){return(e?.language||"en").startsWith("de")?"de":"en"}function ye(e,t){let i=e;for(const e of t){if("object"!=typeof i||null===i)return;const t=i[e];if(void 0===t)return;i=t}return"string"==typeof i?i:void 0}function xe(){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}window.location.reload()}function $e(e,t){if(!e)return G;const i=t("version_update").replace("{v}",e),s=t("version_reload");return K`
    <div class="banner" role="alert" aria-live="assertive">
      <span>${i}</span>
      <button
        type="button"
        aria-label=${s}
        @click=${xe}
      >
        ${s}
      </button>
    </div>
  `}const we=c`
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
    container-type: inline-size;
    container-name: nbcard;

    /* Brand accent — domain-specific, no HA equivalent. */
    --nb-accent: var(--primary-color);

    /* Semantic state tokens layered over HA's official semantic palette
       so theme authors can recolour the whole portfolio in one place;
       hard-coded fallbacks for older HA versions. */
    --nb-rt:      var(--ha-color-success, #43a047);
    --nb-warning: var(--ha-color-warning, #ffa000);
    --nb-error:   var(--ha-color-error,   #db4437);
    --nb-info:    var(--ha-color-info,    #1565c0);

    /* Spacing / radius / sizing — layered over the HA Design System
       so the card moves with HA when tokens evolve. Hard-coded values
       are the fallback for older HA versions. */
    --nb-radius-sm: var(--ha-radius-sm, 6px);
    --nb-radius-md: var(--ha-radius-md, 10px);
    --nb-radius-lg: var(--ha-card-border-radius, var(--ha-radius-lg, 12px));
    --nb-pad-x:     var(--ha-spacing-4, 16px);
    --nb-pad-y:     var(--ha-spacing-3, 14px);
    --nb-row-gap:   var(--ha-spacing-3, 12px);
    --nb-slot-size: 18px;
    --nb-slot-height: 22px;
    --nb-slot-radius: 4px;
    --nb-slot-gap: 4px;
    --nb-tile-size: 40px;
  }
  ha-card {
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
    transition: color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease), box-shadow var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease),
      background-color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
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
    font-weight: var(--ha-font-weight-bold, 600);
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
    font-size: var(--ha-font-size-m, 0.9375rem);
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
    transition: background-color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease), color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
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
    font-weight: var(--ha-font-weight-bold, 600);
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

  /* ── Chips (formerly "pills") ───────────────────────────────────── */
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
  .slot.reserved,
  .slot.disabled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .slot.reserved {
    /* Reserved: bike present but held for another user. Neutral grey
       lock icon — distinct from disabled (amber wrench). */
    background: color-mix(in srgb, var(--secondary-text-color) 10%, transparent);
    box-shadow: inset 0 0 0 1px
      color-mix(in srgb, var(--secondary-text-color) 50%, transparent);
    color: var(--secondary-text-color);
  }
  .slot.reserved ha-icon {
    --mdc-icon-size: 11px;
  }
  .slot.disabled {
    background: color-mix(in srgb, #ffa726 16%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, #ffa726 60%, transparent);
    color: #e65100;
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
    background: color-mix(in srgb, var(--secondary-text-color) 10%, transparent);
    box-shadow: inset 0 0 0 1px
      color-mix(in srgb, var(--secondary-text-color) 50%, transparent);
    color: var(--secondary-text-color);
  }
  .legend-swatch.reserved ha-icon {
    --mdc-icon-size: 9px;
  }
  .legend-swatch.disabled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, #ffa726 16%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, #ffa726 60%, transparent);
    color: #e65100;
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
    transition: filter var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease), transform var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
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
`;function ke(e){return e&&e.states?Object.keys(e.states).filter(t=>{if(!t.startsWith("sensor."))return!1;const i=e.states[t];if(!i)return!1;const s=i.attributes;return!!s&&"string"==typeof s.station_id&&"string"==typeof s.system_id&&s.system_id.startsWith("nextbike_")&&"string"==typeof s.attribution&&s.attribution.startsWith("Data: nextbike")}):[]}function Ae(e){return"string"==typeof e?e.includes(".")?{entity:e}:null:e&&"object"==typeof e&&"string"==typeof e.entity?{entity:e.entity}:null}function Se(e){const t={...e||{}};"string"==typeof t.entity&&t.entity.includes(".")&&(Array.isArray(t.entities)&&0!==t.entities.length||(t.entities=[{entity:t.entity}])),delete t.entity;const i=Array.isArray(t.entities)?t.entities:[];return t.entities=i.map(Ae).filter(e=>null!==e),t.show_rack=!1!==t.show_rack,t.show_legend=!1!==t.show_legend,t.show_ebikes=!1!==t.show_ebikes,t.show_battery=!1!==t.show_battery,t.show_docks=!1!==t.show_docks,t.show_flags=!1!==t.show_flags,t.show_timestamp=!1!==t.show_timestamp,t.show_rent_button=!1!==t.show_rent_button,t.hide_header=!0===t.hide_header,t.hide_attribution=!0===t.hide_attribution,"tabs"!==t.layout&&(t.layout="stacked"),t}function Ee(e){return"number"==typeof e&&Number.isFinite(e)?e>=75?"#2ecc71":e>=50?"#8bc34a":e>=25?"#ffa726":"#e53935":"#2ecc71"}function Ce(e){return String(e).replace(/\s+(Bikes available|Räder verfügbar)$/,"")}const ze=c`
  :host {
    /* color-scheme enables light-dark() and steers forced-colors palette
       selection. HA's active theme drives the resolution. */
    color-scheme: light dark;
    display: block;
  }
  .editor {
    padding: var(--ha-spacing-4, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--ha-spacing-3, 12px);
  }
  .editor-section {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    border-radius: var(--ha-radius-lg, 12px);
    padding: var(--ha-spacing-3, 14px) var(--ha-spacing-4, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--ha-spacing-2, 10px);
  }
  .section-header {
    font-size: var(--ha-font-size-xs, 11px);
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .editor-hint {
    font-size: var(--ha-font-size-xs, 12px);
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
    /* Pill radius — kept fully rounded since 16px is what produces the
       capsule look on this size. Not an HA token target. */
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    /* Be specific about the animated properties — transition: all picks
       up everything (including layout) and is wasteful. Same fast/standard
       motion tokens the card uses. */
    transition:
      background-color var(--ha-transition-duration-fast, 150ms) var(--ha-transition-easing-standard, ease),
      color var(--ha-transition-duration-fast, 150ms) var(--ha-transition-easing-standard, ease),
      border-color var(--ha-transition-duration-fast, 150ms) var(--ha-transition-easing-standard, ease),
      opacity var(--ha-transition-duration-fast, 150ms) var(--ha-transition-easing-standard, ease);
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
    font-size: var(--ha-font-size-xs, 11px);
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
    gap: var(--ha-spacing-2, 8px);
    padding-left: var(--ha-spacing-3, 12px);
    border-left: 2px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    margin-left: 4px;
  }
  .layout-buttons {
    display: inline-flex;
    gap: 4px;
  }
  .layout-buttons button {
    padding: 4px 12px;
    /* Pill radius — fully rounded for these toggle buttons. */
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

  /* ── Accessibility primitives ───────────────────────────────────── */
  /* Focus ring (WCAG 2.4.7 AA; 2px / 3:1 also meets 2.4.13 AAA). */
  .chip:focus-visible,
  .layout-buttons button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Forced-colors fallback (Windows High Contrast). */
  @media (forced-colors: active) {
    .chip:focus-visible,
    .layout-buttons button:focus-visible {
      outline-color: CanvasText;
    }
    .chip,
    .layout-buttons button {
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
`;let Te=class extends de{constructor(){super(...arguments),this._config={type:"nextbike-austria-card",entities:[]},this._toggleStation=e=>{const t=[...this._config.entities||[]],i=t.findIndex(t=>t.entity===e),s=i>=0?t.filter((e,t)=>t!==i):[...t,{entity:e}];this._config={...this._config,entities:s},this._fire()},this._setBool=(e,t)=>{this._config={...this._config,[e]:t},this._fire()},this._setLayout=e=>{"stacked"!==e&&"tabs"!==e||(this._config={...this._config,layout:e},this._fire())}}static{this.styles=ze}setConfig(e){this._config=Se(e)}_et(e){return function(e,t){const i=ve(e);return ye(_e[i]??me,["editor",t])??ye(me,["editor",t])??t}(this.hass,e)}_fire(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:{...this._config}},bubbles:!0,composed:!0}))}render(){const e=this.hass?ke(this.hass):[];e.sort((e,t)=>{const i=String(this.hass?.states[e]?.attributes?.friendly_name||e),s=String(this.hass?.states[t]?.attributes?.friendly_name||t);return i.localeCompare(s)});const t=this._config.entities||[],i=new Set(t.map(e=>e.entity)),s="tabs"===this._config.layout?"tabs":"stacked",r=!1!==this._config.show_rack;return K`
      <div class="editor">
        <div class="editor-section">
          <div class="section-header">${this._et("section_stations")}</div>
          <div class="editor-hint">${this._et("stations_hint")}</div>
          <div class="chips">
            ${e.length?e.map(e=>this._renderStationChip(e,i)):K`<div class="editor-hint">${this._et("no_sensors_available")}</div>`}
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
                aria-pressed=${"stacked"===s?"true":"false"}
                @click=${()=>this._setLayout("stacked")}
              >
                ${this._et("layout_stacked")}
              </button>
              <button
                type="button"
                class=${"tabs"===s?"active":""}
                aria-pressed=${"tabs"===s?"true":"false"}
                @click=${()=>this._setLayout("tabs")}
              >
                ${this._et("layout_tabs")}
              </button>
            </div>
          </div>
          ${this._renderHideToggle("hide_header")}
          ${this._renderToggle("show_rack")}
          ${r?K`
                <div class="sub-toggles">
                  ${this._renderToggle("show_legend")}
                  ${this._renderToggle("show_battery")}
                </div>
              `:G}
          ${this._renderToggle("show_ebikes")}
          ${this._renderToggle("show_docks")}
          ${this._renderToggle("show_flags")}
          ${this._renderToggle("show_timestamp")}
          ${this._renderToggle("show_rent_button")}
          ${this._renderHideToggle("hide_attribution")}
        </div>
      </div>
    `}_renderStationChip(e,t){const i=this.hass?.states[e]?.attributes,s=i?.friendly_name,r="string"==typeof s&&s.length>0,n=Ce(r?s:e),a=t.has(e);return K`
      <button
        type="button"
        class="chip ${a?"selected":""}"
        aria-pressed=${a?"true":"false"}
        @click=${()=>this._toggleStation(e)}
      >
        ${r?K`<span class="stop-name" lang="de">${n}</span>`:K`<span class="stop-name">${n}</span>`}
        <span class="eid">${e.split(".")[1]||e}</span>
      </button>
    `}_renderToggle(e){const t=`nb-toggle-${e}`,i=!1!==this._config[e];return K`
      <div class="toggle-row">
        <label for=${t}>${this._et(e)}</label>
        <ha-switch
          id=${t}
          ?checked=${i}
          @change=${t=>this._setBool(e,t.target.checked)}
        ></ha-switch>
      </div>
    `}_renderHideToggle(e){const t=!0===this._config[e],i=`nb-toggle-${e}`;return K`
      <div class="toggle-row">
        <label for=${i}>${this._et(e)}</label>
        <ha-switch
          id=${i}
          ?checked=${t}
          @change=${t=>this._setBool(e,t.target.checked)}
        ></ha-switch>
      </div>
    `}};s([ge({attribute:!1})],Te.prototype,"hass",void 0),s([fe()],Te.prototype,"_config",void 0),Te=s([pe("nextbike-austria-card-editor")],Te);let Pe=class extends de{constructor(){super(...arguments),this._config={type:"nextbike-austria-card",entities:[]},this._activeTab=0,this._versionMismatch=null,this._tickKey=0,this._tickTimer=null,this._versionChecked=!1}static{this.styles=we}setConfig(e){if(null===e||"object"!=typeof e||Array.isArray(e))throw new Error("nextbike-austria-card: config must be an object");this._config=Se(e)}connectedCallback(){super.connectedCallback(),this._tickTimer||(this._tickTimer=setInterval(()=>{this._tickKey++},6e4))}disconnectedCallback(){super.disconnectedCallback(),this._tickTimer&&(clearInterval(this._tickTimer),this._tickTimer=null)}willUpdate(e){if(e.has("hass")&&this.hass&&!this._versionChecked&&(this._versionChecked=!0,this._checkCardVersion()),e.has("_config")||e.has("hass")){const e=this._resolveEntities();"tabs"===this._config.layout&&e.length>=2&&this._activeTab>=e.length&&(this._activeTab=0)}}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_activeTab")||e.has("_versionMismatch")||e.has("_tickKey"))return!0;if(!e.has("hass"))return!1;const t=e.get("hass");if(!t)return!0;if(!this.hass)return!1;return this._resolveEntities(this.hass).some(e=>t.states[e.entity]!==this.hass.states[e.entity])}getCardSize(){const e=(this._config?.entities||[]).length||1;return Math.min(12,3+3*e)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static async getConfigElement(){return document.createElement("nextbike-austria-card-editor")}static getStubConfig(e){const t=ke(e)[0];return{entities:t?[{entity:t}]:[]}}async _checkCardVersion(){this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const s=await e.callWS({type:t});if(s?.version&&s.version!==i)return s.version}catch{}return null}(this.hass,"nextbike_austria/card_version",e)}_t(e){return function(e,t){const i=ve(e);return ye(_e[i]??me,[t])??ye(me,[t])??t}(this.hass,e)}_resolveEntities(e=this.hass){const t=Array.isArray(this._config?.entities)?this._config.entities.filter(t=>e?.states[t.entity]):[];if(t.length)return t;const i=ke(e)[0];return i?[{entity:i}]:[]}render(){if(!this.hass||!this._config)return G;const e=this._resolveEntities(),t="tabs"===this._config.layout&&e.length>=2,i=e.map(e=>this.hass?.states[e.entity]?.attributes?.attribution).find(e=>"string"==typeof e&&e.length>0)||"Data: nextbike GmbH, CC0-1.0";let s;if(e.length)if(t){const t=e[this._activeTab]??e[0];s=this._renderStation(t,this._activeTab)}else s=e.map(e=>this._renderStation(e));else s=this._renderEmpty();return K`
      <ha-card>
        ${t?this._renderTabs(e):G}
        <div class="wrap">
          ${$e(this._versionMismatch,e=>this._t(e))}
          ${s}
          ${this._config.hide_attribution?G:K`<div class="attr">${i}</div>`}
        </div>
      </ha-card>
    `}_renderEmpty(){const e=ke(this.hass).length?"no_entities_picked":"no_entities_available";return K`<div class="empty-state" role="status">${this._t(e)}</div>`}_renderTabs(e){return K`
      <div class="tabs" role="tablist">
        ${e.map((t,i)=>{const s=this.hass?.states[t.entity]?.attributes||{},r="string"==typeof s.friendly_name&&s.friendly_name.length>0,n=Ce(s.friendly_name||t.entity),a=i===this._activeTab;return K`
            <button
              type="button"
              role="tab"
              id=${`nbtab-${i}`}
              aria-controls=${`nbpanel-${i}`}
              class="tab ${a?"active":""}"
              aria-selected=${a?"true":"false"}
              tabindex=${a?"0":"-1"}
              @click=${()=>this._setActiveTab(i)}
              @keydown=${t=>this._onTabKeydown(t,i,e.length)}
            >
              ${r?K`<span lang="de">${n}</span>`:n}
            </button>
          `})}
      </div>
    `}_setActiveTab(e){Number.isFinite(e)&&e!==this._activeTab&&(this._activeTab=e)}_onTabKeydown(e,t,i){let s=t;switch(e.key){case"ArrowRight":s=(t+1)%i;break;case"ArrowLeft":s=(t-1+i)%i;break;case"Home":s=0;break;case"End":s=i-1;break;default:return}e.preventDefault(),this._setActiveTab(s),this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelectorAll('.tabs [role="tab"]');e?.[s]?.focus()})}_renderStation(e,s){const r=this.hass?.states[e.entity];if(!r)return K`<div class="empty-state" role="status">${this._t("no_entities_unavailable")}</div>`;const n=r.attributes||{},a=Number.isFinite(parseInt(r.state,10))?parseInt(r.state,10):0,o="number"==typeof n.capacity?n.capacity:null,l="number"==typeof n.num_docks_available?n.num_docks_available:null,c=function(e){const t=e?.vehicle_types_available;if(!Array.isArray(t))return null;let s=0;for(const e of t){if(!e||"object"!=typeof e)continue;const t=e,r=String(t.vehicle_type_id??""),n=t.count;i.has(r)&&"number"==typeof n&&Number.isFinite(n)&&(s+=n)}return s}(n),d="number"==typeof n.e_bike_avg_battery_pct?n.e_bike_avg_battery_pct:null,h="number"==typeof n.e_bike_range_samples?n.e_bike_range_samples:0,p=Array.isArray(n.e_bike_battery_list)?n.e_bike_battery_list:null,u=n.vehicle_type_names&&"object"==typeof n.vehicle_type_names?n.vehicle_type_names:{},b=Array.isArray(n.vehicle_types_available)?n.vehicle_types_available:[],g="number"==typeof n.bikes_reserved?n.bikes_reserved:0,f=Array.isArray(n.bikes_reserved_types)?n.bikes_reserved_types:[],_="number"==typeof n.bikes_disabled?n.bikes_disabled:0,m=Array.isArray(n.bikes_disabled_types)?n.bikes_disabled_types:[],v=n.system_id||"",y=t[v]||"var(--primary-color)",x="string"==typeof n.system_label&&n.system_label||v.replace(/^nextbike_/,""),$="string"==typeof n.rental_uri?n.rental_uri:"",w="string"==typeof n.friendly_name&&n.friendly_name.length>0,k=Ce(n.friendly_name||e.entity),A="number"==typeof n.latitude&&"number"==typeof n.longitude?`https://www.google.com/maps/search/?api=1&query=${n.latitude},${n.longitude}`:null,S=1===a?this._t("bike"):this._t("bikes"),E=this._renderPills(c,l,o),C="number"==typeof s;return K`
      <section
        class="station"
        aria-label=${k}
        role=${C?"tabpanel":G}
        id=${C?`nbpanel-${s}`:G}
        aria-labelledby=${C?`nbtab-${s}`:G}
        tabindex=${C?"-1":G}
        style=${`--nb-accent:${y};`}
      >
        ${this._config.hide_header?G:K`<header class="header">
              <div class="icon-tile" aria-hidden="true">
                <ha-icon icon="mdi:bicycle"></ha-icon>
              </div>
              <div class="header-text">
                <h2 class="title">
                  ${w?K`<span lang="de">${k}</span>`:k}
                </h2>
                <p class="subtitle">${x}</p>
              </div>
              ${A?K`
                    <a
                      class="icon-action"
                      href=${A}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label=${`${this._t("open_map")}: ${k}`}
                      title=${this._t("open_map")}
                    >
                      <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>
                    </a>
                  `:G}
            </header>`}

        <div class="hero">
          <div class="metric">
            <div class="metric-value">
              <span class="metric-num">${a}</span>
              ${null!==o?K`<span class="metric-of">/ ${o}</span>`:G}
            </div>
            <div class="metric-label">${S}</div>
          </div>
          ${E.length?K`<div class="chip-row">${E}</div>`:G}
        </div>

        ${this._config.show_rack&&null!==o&&o>0?this._renderRack({bikes:a,ebikes:c,capacity:o,accent:y,batteryPct:d,batterySamples:h,batteryList:p,vehicleTypesAvailable:b,vehicleTypeNames:u,reservedCount:g,reservedTypes:f,disabledCount:_,disabledTypes:m}):G}

        ${this._config.show_flags?this._renderFlags(n):G}
        ${this._renderFooter(n,$)}
      </section>
    `}_renderPills(e,t,i){const s=[];if(this._config.show_ebikes&&"number"==typeof e&&Number.isFinite(e)&&e>0&&s.push(K`
        <span class="chip ebike">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon>${e}
          ${this._t("ebikes")}
        </span>
      `),this._config.show_docks&&null!==t&&null!==i){const e=1===t?this._t("dock"):this._t("docks");s.push(K`
        <span class="chip muted">
          <ha-icon icon="mdi:parking"></ha-icon>${t} ${e}
        </span>
      `)}return s}_renderRack(e){const{bikes:t,ebikes:s,capacity:r,accent:n,batteryPct:a,batterySamples:o,batteryList:l,vehicleTypesAvailable:c,vehicleTypeNames:d,reservedCount:h,reservedTypes:p,disabledCount:u,disabledTypes:b}=e,g=r,f=Math.min(t,r),_=Math.min(Number.isFinite(h)?h:0,Math.max(0,g-f)),m=Math.min(Number.isFinite(u)?u:0,Math.max(0,g-f-_)),v="number"==typeof s&&Number.isFinite(s)&&s>0,y=v?Math.min(f,s):0,x=!!this._config.show_battery&&"number"==typeof a&&o>0,$=x&&Array.isArray(l)?l:[],w=function(e,t){if(!Array.isArray(e))return null;for(const s of e){const e=String(s?.vehicle_type_id??"");if(i.has(e)&&t?.[e])return t[e]}return null}(c,d),k=function(e,t){const s=[];if(!Array.isArray(e))return s;for(const r of e){const e=String(r?.vehicle_type_id??""),n="number"==typeof r?.count&&Number.isFinite(r.count)?r.count:0;if(i.has(e)||n<=0)continue;const a=t?.[e]||"";for(let e=0;e<n;e++)s.push(a)}return s}(c,d);let A=0;const S=[];for(let e=0;e<f;e++){if(e<y){const t=$[e]||null,i=t?.type||w||this._t("legend_ebike");if(t&&x&&"number"==typeof t.pct){const e=t.pct,s=Ee(e),r=`${i} · ${Math.round(e)}%`;S.push(K`
            <div
              class="slot filled ebike battery"
              role="img"
              aria-label=${r}
              style=${`--bat-pct:${e}%;--bat-color:${s};`}
              title=${r}
            ></div>
          `)}else{const e=x?`${i} · ${this._t("battery_unknown")}`:i;S.push(K`
            <div
              class="slot filled ebike"
              role="img"
              aria-label=${e}
              style=${`background:linear-gradient(135deg, ${n} 0%, ${n} 55%, #ffd740 55%, #ffd740 100%);`}
              title=${e}
            ></div>
          `)}}else{const e=k[A++]||this._t("legend_bike");S.push(K`
          <div
            class="slot filled"
            role="img"
            aria-label=${e}
            style=${`background:${n};`}
            title=${e}
          ></div>
        `)}}const E=this._t("reserved");for(let e=0;e<_;e++){const t=p?.[e],i=t?`${t} · ${E}`:E;S.push(K`
        <div
          class="slot reserved"
          role="img"
          aria-label=${i}
          title=${i}
        >
          <ha-icon icon="mdi:lock" aria-hidden="true"></ha-icon>
        </div>
      `)}const C=this._t("disabled");for(let e=0;e<m;e++){const t=b?.[e],i=t?`${t} · ${C}`:C;S.push(K`
        <div
          class="slot disabled"
          role="img"
          aria-label=${i}
          title=${i}
        >
          <ha-icon icon="mdi:wrench" aria-hidden="true"></ha-icon>
        </div>
      `)}for(let e=f+_+m;e<g;e++){const e=this._t("legend_empty");S.push(K`
        <div
          class="slot empty"
          role="img"
          aria-label=${e}
          title=${e}
        ></div>
      `)}const z=t>r,T=f+_+m<g,P=_>0,H=m>0,R=this._t("rack_summary").replace("{available}",String(f)).replace("{capacity}",String(r));return K`
      <div class="rack-block">
        <div class="rack" role="group" aria-label=${R}>
          ${S}
          ${z?K`<span
                class="rack-note"
                aria-label=${"+"+(t-r)}
                >+${t-r}</span
              >`:G}
        </div>
        ${this._config.show_legend?this._renderLegend({accent:n,hasEbikes:v,hasOverflow:z,hasEmptyVisible:T,battery:x&&"number"==typeof a?{pct:a,color:Ee(a)}:null,hasReservedVisible:P,hasDisabledVisible:H}):G}
      </div>
    `}_renderLegend(e){const{accent:t,hasEbikes:i,hasOverflow:s,hasEmptyVisible:r,battery:n,hasReservedVisible:a,hasDisabledVisible:o}=e,l=[K`
        <div class="legend-item">
          <dt class="legend-swatch" style=${`background:${t}`} aria-hidden="true"></dt>
          <dd>${this._t("legend_bike")}</dd>
        </div>
      `];if(i){const e=n?"background:linear-gradient(to top, #2ecc71 70%, color-mix(in srgb, #2ecc71 15%, transparent) 70%);outline:1px solid color-mix(in srgb, #2ecc71 60%, transparent);outline-offset:-1px;":`background:linear-gradient(135deg, ${t} 0%, ${t} 55%, #ffd740 55%, #ffd740 100%);`;l.push(K`
        <div class="legend-item">
          <dt class="legend-swatch" style=${e} aria-hidden="true"></dt>
          <dd>${this._t("legend_ebike")}</dd>
        </div>
      `)}return a&&l.push(K`
        <div class="legend-item">
          <dt class="legend-swatch reserved" aria-hidden="true">
            <ha-icon icon="mdi:lock"></ha-icon>
          </dt>
          <dd>${this._t("legend_reserved")}</dd>
        </div>
      `),o&&l.push(K`
        <div class="legend-item">
          <dt class="legend-swatch disabled" aria-hidden="true">
            <ha-icon icon="mdi:wrench"></ha-icon>
          </dt>
          <dd>${this._t("legend_disabled")}</dd>
        </div>
      `),r&&l.push(K`
        <div class="legend-item">
          <dt class="legend-swatch empty" aria-hidden="true"></dt>
          <dd>${this._t("legend_empty")}</dd>
        </div>
      `),s&&l.push(K`
        <div class="legend-item">
          <dt class="legend-overflow" aria-hidden="true">+N</dt>
          <dd>${this._t("legend_overflow")}</dd>
        </div>
      `),K`<dl class="legend">${l}</dl>`}_renderFlags(e){const t=[];return!1===e.is_installed&&t.push(K`
        <span class="flag err">
          <ha-icon icon="mdi:alert-circle"></ha-icon>${this._t("offline")}
        </span>
      `),!1===e.is_renting&&t.push(K`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t("no_rental")}
        </span>
      `),!1===e.is_returning&&t.push(K`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t("no_return")}
        </span>
      `),!0===e.is_virtual_station&&t.push(K`
        <span class="flag">
          <ha-icon icon="mdi:map-marker-radius"></ha-icon>${this._t("virtual_station")}
        </span>
      `),t.length?K`<div class="flags">${t}</div>`:G}_renderFooter(e,t){const i=!!this._config.show_rent_button&&!!t,s=this._config.show_timestamp?function(e,t){let i=null;if("number"==typeof e&&Number.isFinite(e))i=e;else if("string"==typeof e&&e.length>0){const t=Date.parse(e);Number.isFinite(t)&&(i=t/1e3)}if(null===i)return null;const s=Math.max(0,Math.floor(Date.now()/1e3-i));return s<10?t("now"):s<60?t("seconds_ago").replace("{n}",String(s)):s<3600?t("minutes_ago").replace("{n}",String(Math.floor(s/60))):t("hours_ago").replace("{n}",String(Math.floor(s/3600)))}(e.last_reported,e=>this._t(e)):null;return i||s?K`
      <div class="actions">
        ${i?K`
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
                ${this._t("rent_in_app")}
              </a>
            `:G}
        ${s?K`<span class="timestamp"
              >${this._t("last_updated")} ${s}</span
            >`:G}
      </div>
    `:G}};s([ge({attribute:!1})],Pe.prototype,"hass",void 0),s([fe()],Pe.prototype,"_config",void 0),s([fe()],Pe.prototype,"_activeTab",void 0),s([fe()],Pe.prototype,"_versionMismatch",void 0),s([fe()],Pe.prototype,"_tickKey",void 0),Pe=s([pe("nextbike-austria-card")],Pe);const He=window;He.customCards??=[],He.customCards.push({type:"nextbike-austria-card",name:"Nextbike Austria Card",description:"Station dashboard for nextbike-operated bike-sharing in Austria — bikes, docks, e-bikes, rental deep-link.",preview:!0,documentationURL:"https://github.com/rolandzeiner/nextbike-austria"}),console.info(`%c  NEXTBIKE-AUSTRIA-CARD  %c  v${e}  `,"color: #DC2026; font-weight: bold; background: black","color: white; background: dimgray");
