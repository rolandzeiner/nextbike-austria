// Nextbike Austria Card — bundled by Rollup. Edit sources in src/, then `npm run build`.
const t="0.3.0",e={nextbike_wr:"#DC2026",nextbike_la:"#004E9E",nextbike_si:"#C8102E",nextbike_vt:"#009D58",nextbike_al:"#E30613",nextbike_ka:"#FFC20E"},i={nextbike_wr:"Wien",nextbike_la:"Niederösterreich",nextbike_si:"Innsbruck",nextbike_vt:"Tirol",nextbike_al:"Linz",nextbike_ka:"Klagenfurt"},s=new Set(["143","183","200"]),n=globalThis,r=n.ShadowRoot&&(void 0===n.ShadyCSS||n.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),a=new WeakMap;let l=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(r&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=a.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&a.set(e,t))}return t}toString(){return this.cssText}};const c=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new l(i,t,o)},d=r?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new l("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:h,defineProperty:p,getOwnPropertyDescriptor:u,getOwnPropertyNames:_,getOwnPropertySymbols:g,getPrototypeOf:b}=Object,f=globalThis,y=f.trustedTypes,m=y?y.emptyScript:"",v=f.reactiveElementPolyfillSupport,$=(t,e)=>t,x={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},k=(t,e)=>!h(t,e),w={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:k};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&p(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:n}=u(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);n?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty($("elementProperties")))return;const t=b(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty($("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty($("properties"))){const t=this.properties,e=[..._(t),...g(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(d(t))}else void 0!==t&&e.push(d(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{if(r)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of e){const e=document.createElement("style"),s=n.litNonce;void 0!==s&&e.setAttribute("nonce",s),e.textContent=i.cssText,t.appendChild(e)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:x).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:x;this._$Em=s;const r=n.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){if(void 0!==t){const r=this.constructor;if(!1===s&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??k)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[$("elementProperties")]=new Map,A[$("finalized")]=new Map,v?.({ReactiveElement:A}),(f.reactiveElementVersions??=[]).push("2.1.2");const S=globalThis,E=t=>t,C=S.trustedTypes,T=C?C.createPolicy("lit-html",{createHTML:t=>t}):void 0,z="$lit$",N=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+N,M=`<${P}>`,R=document,U=()=>R.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,H=Array.isArray,B="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,j=/-->/g,L=/>/g,I=RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,V=/"/g,W=/^(?:script|style|textarea|title)$/i,K=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),q=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),Z=new WeakMap,J=R.createTreeWalker(R,129);function X(t,e){if(!H(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(e):e}const Q=(t,e)=>{const i=t.length-1,s=[];let n,r=2===e?"<svg>":3===e?"<math>":"",o=D;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===D?"!--"===l[1]?o=j:void 0!==l[1]?o=L:void 0!==l[2]?(W.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=I):void 0!==l[3]&&(o=I):o===I?">"===l[0]?(o=n??D,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?I:'"'===l[3]?V:F):o===V||o===F?o=I:o===j||o===L?o=D:(o=I,n=void 0);const h=o===I&&t[e+1].startsWith("/>")?" ":"";r+=o===D?i+M:c>=0?(s.push(a),i.slice(0,c)+z+i.slice(c)+N+h):i+N+(-2===c?e:h)}return[X(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Y{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,r=0;const o=t.length-1,a=this.parts,[l,c]=Q(t,e);if(this.el=Y.createElement(l,i),J.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=J.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(z)){const e=c[r++],i=s.getAttribute(t).split(N),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?nt:"?"===o[1]?rt:"@"===o[1]?ot:st}),s.removeAttribute(t)}else t.startsWith(N)&&(a.push({type:6,index:n}),s.removeAttribute(t));if(W.test(s.tagName)){const t=s.textContent.split(N),e=t.length-1;if(e>0){s.textContent=C?C.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],U()),J.nextNode(),a.push({type:2,index:++n});s.append(t[e],U())}}}else if(8===s.nodeType)if(s.data===P)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(N,t+1));)a.push({type:7,index:n}),t+=N.length-1}n++}}static createElement(t,e){const i=R.createElement("template");return i.innerHTML=t,i}}function tt(t,e,i=t,s){if(e===q)return e;let n=void 0!==s?i._$Co?.[s]:i._$Cl;const r=O(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=n:i._$Cl=n),void 0!==n&&(e=tt(t,n._$AS(t,e.values),n,s)),e}class et{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??R).importNode(e,!0);J.currentNode=s;let n=J.nextNode(),r=0,o=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new it(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new at(n,this,t)),this._$AV.push(e),a=i[++o]}r!==a?.index&&(n=J.nextNode(),r++)}return J.currentNode=R,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class it{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=tt(this,t,e),O(t)?t===G||null==t||""===t?(this._$AH!==G&&this._$AR(),this._$AH=G):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>H(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==G&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(R.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Y.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new et(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=Z.get(t.strings);return void 0===e&&Z.set(t.strings,e=new Y(t)),e}k(t){H(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new it(this.O(U()),this.O(U()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=E(t).nextSibling;E(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=G,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(t,e=this,i,s){const n=this.strings;let r=!1;if(void 0===n)t=tt(this,t,e,0),r=!O(t)||t!==this._$AH&&t!==q,r&&(this._$AH=t);else{const s=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=tt(this,s[i+o],e,o),a===q&&(a=this._$AH[o]),r||=!O(a)||a!==this._$AH[o],a===G?t=G:t!==G&&(t+=(a??"")+n[o+1]),this._$AH[o]=a}r&&!s&&this.j(t)}j(t){t===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class nt extends st{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===G?void 0:t}}class rt extends st{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==G)}}class ot extends st{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=tt(this,t,e,0)??G)===q)return;const i=this._$AH,s=t===G&&i!==G||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==G&&(i===G||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class at{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){tt(this,t)}}const lt=S.litHtmlPolyfillSupport;lt?.(Y,it),(S.litHtmlVersions??=[]).push("3.3.2");const ct=globalThis;class dt extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let n=s._$litPart$;if(void 0===n){const t=i?.renderBefore??null;s._$litPart$=n=new it(e.insertBefore(U(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}dt._$litElement$=!0,dt.finalized=!0,ct.litElementHydrateSupport?.({LitElement:dt});const ht=ct.litElementPolyfillSupport;ht?.({LitElement:dt}),(ct.litElementVersions??=[]).push("4.2.2");const pt={de:{no_entities_picked:"Keine Station ausgewählt",no_entities_available:"Keine Nextbike-Sensoren gefunden",offline:"offline",no_rental:"keine Ausleihe",no_return:"keine Rückgabe",virtual_station:"virtuelle Station",bikes:"Räder",bike:"Rad",docks:"Plätze",dock:"Platz",ebikes:"E-Bikes",capacity:"Kapazität",last_updated:"aktualisiert",now:"gerade eben",seconds_ago:"vor {n}s",minutes_ago:"vor {n}min",hours_ago:"vor {n}h",rent_in_app:"In App mieten",open_map:"Karte",legend_bike:"Rad",legend_ebike:"E-Bike",legend_empty:"Freier Platz",legend_overflow:"Überzählig",legend_reserved:"Reserviert",reserved:"Reserviert",legend_disabled:"Ausser Betrieb",disabled:"Ausser Betrieb",battery_unknown:"Batterie unbekannt",version_update:"Nextbike Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",editor:{section_stations:"Stationen",stations_hint:"Eine oder mehrere Stationen anzeigen.",section_display:"Anzeige",layout_label:"Mehrfach-Layout",layout_stacked:"Gestapelt",layout_tabs:"Reiter",show_rack:"Bike-Rack anzeigen",show_legend:"Legende anzeigen",show_battery:"Batterie im E-Bike-Slot anzeigen",show_ebikes:"E-Bike-Anzeige",show_docks:"Plätze anzeigen",show_flags:"Statussymbole anzeigen",show_timestamp:"Zeitstempel anzeigen",show_rent_button:"App-Mietlink anzeigen",hide_attribution:"Datenquelle ausblenden",no_sensors_available:"Keine Nextbike-Sensoren verfügbar. Erst eine Station über Einstellungen → Geräte & Dienste hinzufügen."}},en:{no_entities_picked:"No station selected",no_entities_available:"No nextbike sensors found",offline:"offline",no_rental:"no rental",no_return:"no return",virtual_station:"virtual station",bikes:"bikes",bike:"bike",docks:"docks",dock:"dock",ebikes:"e-bikes",capacity:"capacity",last_updated:"updated",now:"just now",seconds_ago:"{n}s ago",minutes_ago:"{n}min ago",hours_ago:"{n}h ago",rent_in_app:"Rent in app",open_map:"Map",legend_bike:"Bike",legend_ebike:"E-bike",legend_empty:"Empty dock",legend_overflow:"Overflow",legend_reserved:"Reserved",reserved:"Reserved",legend_disabled:"Out of service",disabled:"Out of service",battery_unknown:"battery unknown",version_update:"Nextbike Austria updated to v{v} — please reload",version_reload:"Reload",editor:{section_stations:"Stations",stations_hint:"Show one or more stations.",section_display:"Display",layout_label:"Multi-station layout",layout_stacked:"Stacked",layout_tabs:"Tabs",show_rack:"Show bike rack",show_legend:"Show legend",show_battery:"Show battery in e-bike slot",show_ebikes:"Show e-bikes",show_docks:"Show docks",show_flags:"Show status flags",show_timestamp:"Show timestamp",show_rent_button:"Show app-rent link",hide_attribution:"Hide attribution",no_sensors_available:"No nextbike sensors available. Add a station first via Settings → Devices & Services."}}};function ut(t){return(t?.language||"en").startsWith("de")?"de":"en"}const _t=c`
  :host {
    display: block;
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
    display: flex;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    margin-bottom: 10px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab {
    flex: 0 0 auto;
    padding: 8px 14px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--secondary-text-color);
    font-size: 0.95em;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
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
    font-size: 1.05em;
    font-weight: 600;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .subtitle {
    font-size: 0.78em;
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
    font-size: 0.78em;
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
    font-size: 2.4em;
    font-weight: 700;
    line-height: 1;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  .bikes-of {
    font-size: 1em;
    color: var(--secondary-text-color);
    font-weight: 400;
  }
  .bikes-label {
    color: var(--secondary-text-color);
    font-size: 0.95em;
    margin-left: -6px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.78em;
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
    width: 16px;
    height: 18px;
    box-sizing: border-box;
    border-radius: 2px;
    flex: 0 0 16px;
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
    font-size: 0.75em;
    line-height: 18px;
    color: var(--secondary-text-color);
    margin-left: 6px;
    flex-shrink: 0;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin: 0 0 6px;
    padding: 0 2px;
    font-size: 0.72em;
    color: var(--secondary-text-color);
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
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
    font-size: 0.82em;
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
    font-size: 0.78em;
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
    font-size: 0.72em;
    color: var(--secondary-text-color);
    text-align: center;
    opacity: 0.7;
  }
  .empty-state {
    padding: 20px 0;
    text-align: center;
    color: var(--secondary-text-color);
  }
`;function gt(t){return t&&t.states?Object.keys(t.states).filter(e=>{if(!e.startsWith("sensor."))return!1;const i=t.states[e].attributes;return i&&"string"==typeof i.station_id&&"string"==typeof i.system_id&&i.system_id.startsWith("nextbike_")&&"string"==typeof i.attribution&&i.attribution.startsWith("Data: nextbike")}):[]}function bt(t){return"string"==typeof t?t.includes(".")?{entity:t}:null:t&&"object"==typeof t&&"string"==typeof t.entity?{entity:t.entity}:null}function ft(t){const e={...t||{}};"string"==typeof e.entity&&e.entity.includes(".")&&(Array.isArray(e.entities)&&0!==e.entities.length||(e.entities=[e.entity])),delete e.entity;const i=Array.isArray(e.entities)?e.entities:[];return e.entities=i.map(bt).filter(t=>null!==t),e.show_rack=!1!==e.show_rack,e.show_legend=!1!==e.show_legend,e.show_ebikes=!1!==e.show_ebikes,e.show_battery=!1!==e.show_battery,e.show_docks=!1!==e.show_docks,e.show_flags=!1!==e.show_flags,e.show_timestamp=!1!==e.show_timestamp,e.show_rent_button=!1!==e.show_rent_button,e.hide_attribution=!0===e.hide_attribution,"tabs"!==e.layout&&(e.layout="stacked"),e}function yt(t){return Number.isFinite(t)?t>=75?"#2ecc71":t>=50?"#8bc34a":t>=25?"#ffa726":"#e53935":"#2ecc71"}function mt(t){return String(t).replace(/\s+(Bikes available|Räder verfügbar)$/,"")}class vt extends dt{static properties={hass:{attribute:!1},_config:{state:!0},_activeTab:{state:!0},_versionMismatch:{state:!0},_tickKey:{state:!0}};static styles=_t;constructor(){super(),this._config={},this._activeTab=0,this._versionMismatch=null,this._tickKey=0,this._tickTimer=null,this._versionChecked=!1}setConfig(t){if(null===t||"object"!=typeof t||Array.isArray(t))throw new Error("nextbike-austria-card: config must be an object");this._config=ft(t)}connectedCallback(){super.connectedCallback(),this._tickTimer||(this._tickTimer=setInterval(()=>{this._tickKey++},6e4))}disconnectedCallback(){super.disconnectedCallback(),this._tickTimer&&(clearInterval(this._tickTimer),this._tickTimer=null)}willUpdate(t){t.has("hass")&&this.hass&&!this._versionChecked&&(this._versionChecked=!0,this._checkCardVersion())}shouldUpdate(t){if(!this._config)return!1;if(t.has("_config")||t.has("_activeTab")||t.has("_versionMismatch")||t.has("_tickKey"))return!0;if(!t.has("hass"))return!1;const e=t.get("hass");if(!e)return!0;return this._resolveEntities(this.hass).some(t=>e.states[t.entity]!==this.hass.states[t.entity])}getCardSize(){const t=(this._config?.entities||[]).length||1;return Math.min(12,3+3*t)}static async getConfigElement(){return await Promise.resolve().then(function(){return kt}),document.createElement("nextbike-austria-card-editor")}static getStubConfig(t){const e=gt(t);return{entities:e.length?[e[0]]:[]}}async _checkCardVersion(){if(this.hass?.callWS)try{const e=await this.hass.callWS({type:"nextbike_austria/card_version"});e?.version&&e.version!==t&&(this._versionMismatch=e.version)}catch(t){}}_t(t){const e=ut(this.hass);return pt[e][t]??pt.en[t]??t}_resolveEntities(t=this.hass){const e=Array.isArray(this._config?.entities)?this._config.entities.filter(e=>t?.states[e.entity]):[];if(e.length)return e;const i=gt(t);return i.length?[{entity:i[0]}]:[]}render(){if(!this.hass||!this._config)return G;const t=this._resolveEntities(),e="tabs"===this._config.layout&&t.length>=2;e&&this._activeTab>=t.length&&(this._activeTab=0);const i=t.map(t=>this.hass.states[t.entity]?.attributes?.attribution).find(t=>"string"==typeof t&&t.length>0)||"Data: nextbike GmbH, CC0-1.0";let s;return s=t.length?e?K`${this._renderTabs(t)}${this._renderStation(t[this._activeTab])}`:t.map(t=>this._renderStation(t)):this._renderEmpty(),K`
      <ha-card>
        <div class="wrap">
          ${this._versionMismatch?this._renderBanner():G}
          ${s}
          ${this._config.hide_attribution?G:K`<div class="attr">${i}</div>`}
        </div>
      </ha-card>
    `}_renderBanner(){const t=this._t("version_update").replace("{v}",this._versionMismatch||"?");return K`
      <div class="banner">
        <span>${t}</span>
        <button type="button" @click=${()=>window.location.reload()}>
          ${this._t("version_reload")}
        </button>
      </div>
    `}_renderEmpty(){const t=gt(this.hass).length?"no_entities_picked":"no_entities_available";return K`<div class="empty-state">${this._t(t)}</div>`}_renderTabs(t){return K`
      <div class="tabs">
        ${t.map((t,e)=>{const i=mt((this.hass.states[t.entity]?.attributes||{}).friendly_name||t.entity);return K`
            <button
              type="button"
              class="tab ${e===this._activeTab?"active":""}"
              @click=${()=>this._setActiveTab(e)}
            >
              ${i}
            </button>
          `})}
      </div>
    `}_setActiveTab(t){Number.isFinite(t)&&t!==this._activeTab&&(this._activeTab=t)}_renderStation(t){const n=this.hass.states[t.entity];if(!n)return K`<div class="empty-state">${this._t("no_entities_picked")}</div>`;const r=n.attributes||{},o=Number.isFinite(parseInt(n.state,10))?parseInt(n.state,10):0,a="number"==typeof r.capacity?r.capacity:null,l="number"==typeof r.num_docks_available?r.num_docks_available:null,c=function(t){const e=t?.vehicle_types_available;if(!Array.isArray(e))return null;let i=0;for(const t of e){if(!t||"object"!=typeof t)continue;const e=String(t.vehicle_type_id||""),n=t.count;s.has(e)&&Number.isFinite(n)&&(i+=n)}return i}(r),d="number"==typeof r.e_bike_avg_battery_pct?r.e_bike_avg_battery_pct:null,h="number"==typeof r.e_bike_range_samples?r.e_bike_range_samples:0,p=Array.isArray(r.e_bike_battery_list)?r.e_bike_battery_list:null,u=r.vehicle_type_names&&"object"==typeof r.vehicle_type_names?r.vehicle_type_names:{},_=Array.isArray(r.vehicle_types_available)?r.vehicle_types_available:[],g="number"==typeof r.bikes_reserved?r.bikes_reserved:0,b=Array.isArray(r.bikes_reserved_types)?r.bikes_reserved_types:[],f="number"==typeof r.bikes_disabled?r.bikes_disabled:0,y=Array.isArray(r.bikes_disabled_types)?r.bikes_disabled_types:[],m=r.system_id||"",v=e[m]||"var(--primary-color)",$=i[m]||m.replace(/^nextbike_/,""),x="string"==typeof r.rental_uri?r.rental_uri:"",k=mt(r.friendly_name||t.entity),w="number"==typeof r.latitude&&"number"==typeof r.longitude?`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`:null,A=1===o?this._t("bike"):this._t("bikes");return K`
      <div class="station">
        <div class="header">
          <div class="accent" style=${`background:${v}`}></div>
          <div style="min-width:0;flex:1;">
            <div class="title">${k}</div>
            <div class="subtitle">${$}</div>
          </div>
          ${w?K`
                <a
                  class="header-link"
                  href=${w}
                  target="_blank"
                  rel="noopener noreferrer"
                  title=${this._t("open_map")}
                >
                  <ha-icon icon="mdi:map-marker"></ha-icon>${this._t("open_map")}
                </a>
              `:G}
        </div>

        <div class="primary">
          <span class="bikes-num">${o}</span>
          ${null!==a?K`<span class="bikes-of">/ ${a}</span>`:G}
          <span class="bikes-label">${A}</span>
          <span class="pill-row">${this._renderPills(c,l,a)}</span>
        </div>

        ${this._config.show_rack&&null!==a&&a>0?this._renderRack({bikes:o,ebikes:c,capacity:a,accent:v,batteryPct:d,batterySamples:h,batteryList:p,vehicleTypesAvailable:_,vehicleTypeNames:u,reservedCount:g,reservedTypes:b,disabledCount:f,disabledTypes:y}):G}

        ${this._config.show_flags?this._renderFlags(r):G}
        ${this._renderFooter(r,x)}
      </div>
    `}_renderPills(t,e,i){const s=[];if(this._config.show_ebikes&&Number.isFinite(t)&&t>0&&s.push(K`
        <span class="pill ebike">
          <ha-icon icon="mdi:lightning-bolt"></ha-icon>${t}
          ${this._t("ebikes")}
        </span>
      `),this._config.show_docks&&null!==e&&null!==i){const t=1===e?this._t("dock"):this._t("docks");s.push(K`
        <span class="pill muted">
          <ha-icon icon="mdi:parking"></ha-icon>${e} ${t}
        </span>
      `)}return s}_renderRack({bikes:t,ebikes:e,capacity:i,accent:n,batteryPct:r,batterySamples:o,batteryList:a,vehicleTypesAvailable:l,vehicleTypeNames:c,reservedCount:d,reservedTypes:h,disabledCount:p,disabledTypes:u}){const _=i,g=Math.min(t,i),b=Math.min(Number.isFinite(d)?d:0,Math.max(0,_-g)),f=Math.min(Number.isFinite(p)?p:0,Math.max(0,_-g-b)),y=Number.isFinite(e)&&e>0,m=y?Math.min(g,e):0,v=this._config.show_battery&&"number"==typeof r&&o>0,$=v&&Array.isArray(a)?a:[],x=function(t,e){if(!Array.isArray(t))return null;for(const i of t){const t=String(i?.vehicle_type_id||"");if(s.has(t)&&e?.[t])return e[t]}return null}(l,c),k=function(t,e){const i=[];if(!Array.isArray(t))return i;for(const n of t){const t=String(n?.vehicle_type_id||""),r=Number.isFinite(n?.count)?n.count:0;if(s.has(t)||r<=0)continue;const o=e?.[t]||"";for(let t=0;t<r;t++)i.push(o)}return i}(l,c);let w=0;const A=[];for(let t=0;t<g;t++){if(t<m){const e=$[t]||null,i=e?.type||x||this._t("legend_ebike");if(e&&v){const t=e.pct,s=yt(t);A.push(K`
            <div
              class="slot filled ebike battery"
              style=${`--bat-pct:${t}%;--bat-color:${s};`}
              title=${`${i} · ${Math.round(t)}%`}
            ></div>
          `)}else{const t=v?`${i} · ${this._t("battery_unknown")}`:i;A.push(K`
            <div
              class="slot filled ebike"
              style=${`background:linear-gradient(135deg, ${n} 0%, ${n} 55%, #ffd740 55%, #ffd740 100%);`}
              title=${t}
            ></div>
          `)}}else{const t=k[w++]||this._t("legend_bike");A.push(K`
          <div
            class="slot filled"
            style=${`background:${n};`}
            title=${t}
          ></div>
        `)}}const S=this._t("reserved");for(let t=0;t<b;t++){const e=h?.[t],i=e?`${e} · ${S}`:S;A.push(K`
        <div class="slot reserved" title=${i}>
          <ha-icon icon="mdi:lock"></ha-icon>
        </div>
      `)}const E=this._t("disabled");for(let t=0;t<f;t++){const e=u?.[t],i=e?`${e} · ${E}`:E;A.push(K`
        <div class="slot disabled" title=${i}>
          <ha-icon icon="mdi:wrench"></ha-icon>
        </div>
      `)}for(let t=g+b+f;t<_;t++)A.push(K`
        <div class="slot empty" title=${this._t("legend_empty")}></div>
      `);const C=t>i,T=g+b+f<_,z=b>0,N=f>0;return K`
      <div class="rack">
        ${A}
        ${C?K`<span class="rack-note">+${t-i}</span>`:G}
      </div>
      ${this._config.show_legend?this._renderLegend({accent:n,hasEbikes:y,hasOverflow:C,hasEmptyVisible:T,battery:v?{pct:r,color:yt(r)}:null,hasReservedVisible:z,hasDisabledVisible:N}):G}
    `}_renderLegend({accent:t,hasEbikes:e,hasOverflow:i,hasEmptyVisible:s,battery:n,hasReservedVisible:r,hasDisabledVisible:o}){const a=[K`
        <span class="legend-item">
          <span class="legend-swatch" style=${`background:${t}`}></span>
          ${this._t("legend_bike")}
        </span>
      `];if(e){const e=n?"background:linear-gradient(to top, #2ecc71 70%, color-mix(in srgb, #2ecc71 15%, transparent) 70%);outline:1px solid color-mix(in srgb, #2ecc71 60%, transparent);outline-offset:-1px;":`background:linear-gradient(135deg, ${t} 0%, ${t} 55%, #ffd740 55%, #ffd740 100%);`;a.push(K`
        <span class="legend-item">
          <span class="legend-swatch" style=${e}></span>
          ${this._t("legend_ebike")}
        </span>
      `)}return r&&a.push(K`
        <span class="legend-item">
          <span class="legend-swatch reserved">
            <ha-icon icon="mdi:lock"></ha-icon>
          </span>
          ${this._t("legend_reserved")}
        </span>
      `),o&&a.push(K`
        <span class="legend-item">
          <span class="legend-swatch disabled">
            <ha-icon icon="mdi:wrench"></ha-icon>
          </span>
          ${this._t("legend_disabled")}
        </span>
      `),s&&a.push(K`
        <span class="legend-item">
          <span class="legend-swatch empty"></span>
          ${this._t("legend_empty")}
        </span>
      `),i&&a.push(K`
        <span class="legend-item">
          <span class="legend-overflow">+N</span>
          ${this._t("legend_overflow")}
        </span>
      `),K`<div class="legend">${a}</div>`}_renderFlags(t){const e=[];return!1===t.is_installed&&e.push(K`
        <span class="flag err">
          <ha-icon icon="mdi:alert-circle"></ha-icon>${this._t("offline")}
        </span>
      `),!1===t.is_renting&&e.push(K`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t("no_rental")}
        </span>
      `),!1===t.is_returning&&e.push(K`
        <span class="flag warn">
          <ha-icon icon="mdi:cancel"></ha-icon>${this._t("no_return")}
        </span>
      `),!0===t.is_virtual_station&&e.push(K`
        <span class="flag">
          <ha-icon icon="mdi:map-marker-radius"></ha-icon>${this._t("virtual_station")}
        </span>
      `),e.length?K`<div class="flags">${e}</div>`:G}_renderFooter(t,e){const i=[];if(this._config.show_rent_button&&e&&i.push(K`
        <a class="rent" href=${e} target="_blank" rel="noopener noreferrer">
          <ha-icon icon="mdi:cellphone-arrow-down"></ha-icon>${this._t("rent_in_app")}
        </a>
      `),this._config.show_timestamp){const e=function(t,e){if(!Number.isFinite(t))return null;const i=Math.max(0,Math.floor(Date.now()/1e3-t));return i<10?e("now"):i<60?e("seconds_ago").replace("{n}",String(i)):i<3600?e("minutes_ago").replace("{n}",String(Math.floor(i/60))):e("hours_ago").replace("{n}",String(Math.floor(i/3600)))}(t.last_reported,t=>this._t(t));e&&i.push(K`<span>${this._t("last_updated")} ${e}</span>`)}return i.length?K`<div class="footer">${i}</div>`:G}}try{customElements.get("nextbike-austria-card")||customElements.define("nextbike-austria-card",vt)}catch(T){console.error("[Nextbike Austria] custom element registration failed",T)}window.customCards=window.customCards||[],window.customCards.push({type:"nextbike-austria-card",name:"Nextbike Austria Card",description:"Station dashboard for nextbike-operated bike-sharing in Austria — bikes, docks, e-bikes, rental deep-link.",preview:!0,documentationURL:"https://github.com/rolandzeiner/nextbike-austria"}),console.info(`%c  NEXTBIKE-AUSTRIA-CARD  %c  v${t}  `,"color: #DC2026; font-weight: bold; background: black","color: white; background: dimgray");const $t=c`
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
`;class xt extends dt{static properties={hass:{attribute:!1},_config:{state:!0}};static styles=$t;constructor(){super(),this._config={}}setConfig(t){this._config=ft(t)}_et(t){return function(t,e){const i=ut(t);return pt[i]?.editor?.[e]??pt.en.editor[e]??e}(this.hass,t)}_t(t){const e=ut(this.hass);return pt[e][t]??pt.en[t]??t}_fire(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:{...this._config}},bubbles:!0,composed:!0}))}_toggleStation(t){const e=[...this._config.entities||[]],i=e.findIndex(e=>e.entity===t),s=i>=0?e.filter((t,e)=>e!==i):[...e,{entity:t}];this._config={...this._config,entities:s},this._fire()}_setBool(t,e){this._config={...this._config,[t]:e},this._fire()}_setLayout(t){"stacked"!==t&&"tabs"!==t||(this._config={...this._config,layout:t},this._fire())}render(){if(!this.hass)return G;const t=gt(this.hass),e=this._config.entities||[],i=new Set(e.map(t=>t.entity)),s="tabs"===this._config.layout?"tabs":"stacked";return K`
      <div class="editor">
        <div class="editor-section">
          <div class="section-header">${this._et("section_stations")}</div>
          <div class="editor-hint">${this._et("stations_hint")}</div>
          <div class="chips">
            ${t.length?t.map(t=>this._renderStationChip(t,i)):K`<div class="editor-hint">${this._et("no_sensors_available")}</div>`}
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
          ${this._renderToggle("show_legend")}
          ${this._renderToggle("show_ebikes")}
          ${this._renderToggle("show_battery")}
          ${this._renderToggle("show_docks")}
          ${this._renderToggle("show_flags")}
          ${this._renderToggle("show_timestamp")}
          ${this._renderToggle("show_rent_button")}
          ${this._renderHideAttribution()}
        </div>
      </div>
    `}_renderStationChip(t,e){const i=this.hass.states[t]?.attributes,s=mt(i?.friendly_name||t),n=e.has(t);return K`
      <button
        type="button"
        class="chip ${n?"selected":""}"
        @click=${()=>this._toggleStation(t)}
      >
        <span class="stop-name">${s}</span>
        <span class="eid">${t.split(".")[1]||t}</span>
      </button>
    `}_renderToggle(t){const e=`nb-toggle-${t}`,i=!1!==this._config[t];return K`
      <div class="toggle-row">
        <label for=${e}>${this._et(t)}</label>
        <ha-switch
          id=${e}
          ?checked=${i}
          @change=${e=>this._setBool(t,e.target.checked)}
        ></ha-switch>
      </div>
    `}_renderHideAttribution(){const t=!0===this._config.hide_attribution;return K`
      <div class="toggle-row">
        <label for="nb-toggle-hide_attribution">
          ${this._et("hide_attribution")}
        </label>
        <ha-switch
          id="nb-toggle-hide_attribution"
          ?checked=${t}
          @change=${t=>this._setBool("hide_attribution",t.target.checked)}
        ></ha-switch>
      </div>
    `}}customElements.get("nextbike-austria-card-editor")||customElements.define("nextbike-austria-card-editor",xt);var kt=Object.freeze({__proto__:null,NextbikeAustriaCardEditor:xt});
