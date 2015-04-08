/**
*  PublishSubscribe
*  A simple publish-subscribe implementation for PHP, Python, Node/JS
*
*  @version: 0.4
*  https://github.com/foo123/PublishSubscribe
*
**/
!function(t,s,n){"use strict";var e,i="object"==typeof module&&module.exports,o="function"==typeof define&&define.amd;i?module.exports=(module.$deps=module.$deps||{})[s]=module.$deps[s]||n.call(t,{NODE:module})||1:o&&"function"==typeof require&&"function"==typeof require.specified&&require.specified(s)?define(s,["require","exports","module"],function(s,e,i){return n.call(t,{AMD:i})}):s in t||(t[s]=e=n.call(t,{})||1)&&o&&define(s,[],function(){return e})}(this,"PublishSubscribe",function(){"use strict";function t(t){if(t)for(var s in t)t[O](s)&&(this[s]=t[s])}function s(s,n,e,i,o){var l=this;l.target=s,l.topic=n?[].concat(n):[],e&&(l.originalTopic=[].concat(e)),l.tags=i?[].concat(i):[],l.namespaces=o?[].concat(o):[],l.data=new t,l.timestamp=S(),l._propagates=!0,l._stopped=!1,l._aborted=!1}function n(){return{notopics:{notags:{namespaces:{},list:[],oneOffs:0},tags:{}},topics:{}}}function e(t){return t.length>0}function i(t,s){var n,i,o,l;return s=String(s),n=s.indexOf(t[2]),i=s.indexOf(t[1]),n>-1?(l=s.slice(n).split(t[2]).filter(e).sort(),s=s.slice(0,n)):l=[],i>-1?(o=s.slice(i).split(t[1]).filter(e).sort(),s=s.slice(0,i)):o=[],s=s.split(t[0]).filter(e),[s,o,l]}function o(t,s){var n,e,o,l,p,a,r,u,c=[],f=[];for(s=i(t,s),n=s[2],e=s[1],s=s[0],o=s.length;o;)c.push(s.join(w)),s.pop(),o--;if(o=e.length,o>1){for(u=1<<o,l=u-1;l>=1;l--){for(r=[],p=0,a=1;o>p;p++,a=1<<p)l!==a&&l&a&&r.push(e[p]);r.length&&f.push(r.join(j))}f=f.concat(e)}else o&&f.push(e[0]);return[c.length?c[0]:"",c,f,n]}function l(t,s,n){var e,i;for(e=0;n>e;e++)i="ns_"+s[e],t[O](i)?t[i]++:t[i]=1}function p(t,s,n){var e,i;for(e=0;n>e;e++)i="ns_"+s[e],t[O](i)&&(t[i]--,t[i]<=0&&delete t[i])}function a(t,s,n){var e,i;for(e=0;n>e;e++)if(i="ns_"+s[e],!t[O](i)||0>=t[i])return!1;return!0}function r(t,s,n,e,i,o){var l=n?"tp_"+n:!1,p=e?"tg_"+e:!1;if(l&&t.topics[O](l)){if(p&&t.topics[l].tags[O](p)){if(t.topics[l].tags[p].list.length&&(0>=o||a(t.topics[l].tags[p].namespaces,i,o)))return s.push([n,e,o>0,t.topics[l].tags[p]]),!0}else if(t.topics[l].notags.list.length&&(0>=o||a(t.topics[l].notags.namespaces,i,o)))return s.push([n,null,o>0,t.topics[l].notags]),!0}else if(p&&t.notopics.tags[O](p)){if(t.notopics.tags[p].list.length&&(0>=o||a(t.notopics.tags[p].namespaces,i,o)))return s.push([null,e,o>0,t.notopics.tags[p]]),!0}else if(t.notopics.notags.list.length&&(0>=o||a(t.notopics.notags.namespaces,i,o)))return s.push([null,null,!0,t.notopics.notags]),!0;return!1}function u(t,s,n){var e,i,l,p,a,u,c=o(t,n),f=c[1],g=c[2],h=c[3],b=c[0],_=[];if(a=g.length,u=h.length,e=f.length)for(;e;){if(i=f[0],s.topics[O]("tp_"+i))if(a>0)for(p=0;a>p;p++)l=g[p],r(s,_,i,l,h,u);else r(s,_,i,null,h,u);f.shift(),e--}if(a>0)for(p=0;a>p;p++)l=g[p],r(s,_,null,l,h,u);return r(s,_,null,null,h,u),[b,_,h]}function c(t){if(t&&t[O]("list")){var s,n,e,i;if((e=t.list)&&(n=e.length))if(t.oneOffs>0)for(s=n-1;s>=0;s--)i=e[s],i[1]&&i[4]>0&&(e.splice(s,1),t.oneOffs=t.oneOffs>0?t.oneOffs-1:0);else t.oneOffs=0}return t}function f(t,n,e,i,o){if(e){var l,p,r,f,g,h,b,_,d,m,v,O,y,$,x=u(n,e,i),T=!1;for(_=x[0],v=x[2],y=v.length,x=x[1],r=x.length,$=null,r>0&&($=new s(t),$.data.data=o,$.originalTopic=_?_.split(w):[]),l=0;r>l;l++){for(d=x[l][0],m=x[l][1],$.topic=d?d.split(w):[],$.tags=m?m.split(j):[],O=x[l][2],h=x[l][3],g=[],f=h.list.length,p=0;f>p;p++)b=h.list[p],b[1]&&b[4]||!(!O||b[2]&&a(b[2],v,y))||g.push(b);for(f=g.length,p=0;f>p&&(b=g[p],$.namespaces=O?b[3].slice(0):[],b[4]=1,T=b[0]($),!1!==T&&!$.stopped()&&!$.aborted());p++);if(c(h),$.aborted()||!$.propagates())break}$&&($.dispose(),$=null)}}function g(s,n,e){var i=n[0],o=n[2],n=n[1];s.non_local=new t({t:0,s:0,start_topic:!0,subscribers:null,topics:n,namespaces:o,hasNamespace:!1,abort:e}),s.originalTopic=i?i.split(w):[];var l=function(t){var s,n,e,i,o,l=t.non_local;if(l.t<l.topics.length){if(l.start_topic){if(c(l.subscribers),t.aborted()||!t.propagates())return t.aborted()&&"function"==typeof l.abort&&l.abort(t),!1;n=l.topics[l.t][0],e=l.topics[l.t][1],t.topic=n?n.split(w):[],t.tags=e?e.split(j):[],l.hasNamespace=l.topics[l.t][2],l.subscribers=l.topics[l.t][3],l.s=0,l.start_topic=!1}if(l.s<l.subscribers.list.length){if(t.aborted()||t.stopped())return c(l.subscribers),t.aborted()&&"function"==typeof l.abort&&l.abort(t),!1;for(o=!1;l.s<l.subscribers.list.length&&!o;)i=l.subscribers.list[l.s],i[1]&&i[4]||!(!l.hasNamespace||i[2]&&a(i[2],l.namespaces,l.namespaces.length))||(o=!0),l.s+=1;o&&(t.namespaces=l.hasNamespace?i[3].slice(0):[],i[4]=1,s=i[0](t))}l.s>=l.subscribers.list.length&&(l.t+=1,l.start_topic=!0)}else c(l.subscribers),t&&(t.non_local.dispose(),t.non_local=null,t.dispose(),t=null)};return l}function h(t,n,e,i,o,l){if(e){var p,a=u(n,e,i),r=null;a[1].length>0&&(r=new s(t),r.data.data=o,r.pipeline(p=g(r,a,l)),p(r))}}function b(t,s,n,e,o,p){if(s&&"function"==typeof e){n=i(t,n);var a,r,u,c,f,g,h,b=n[1].join(j),_=b.length,d=n[2],m=d.length;if(n=n[0].join(w),o=!0===o,p=!0===p,f={},m)for(h=0;m>h;h++)f["ns_"+d[h]]=1;g=d.slice(0),r=null,n.length?(u="tp_"+n,s.topics[O](u)||(s.topics[u]={notags:{namespaces:{},list:[],oneOffs:0},tags:{}}),_?(c="tg_"+b,s.topics[u].tags[O](c)||(s.topics[u].tags[c]={namespaces:{},list:[],oneOffs:0}),r=s.topics[u].tags[c]):r=s.topics[u].notags):_?(c="tg_"+b,s.notopics.tags[O](c)||(s.notopics.tags[c]={namespaces:{},list:[],oneOffs:0}),r=s.notopics.tags[c]):m&&(r=s.notopics.notags),null!==r&&(a=m?[e,o,f,g,0]:[e,o,!1,[],0],p?r.list.unshift(a):r.list.push(a),o&&r.oneOffs++,m&&l(r.namespaces,d,m))}}function _(t,s,n,e,i){var o,l=t.list.length;if(s){if(null!=n&&l>0)for(;--l>=0;)n===t.list[l][0]&&(i&&t.list[l][2]&&a(t.list[l][2],e,i)?(o=T(t.list[l][2]),p(t.namespaces,o,o.length),t.list[l][1]&&(t.oneOffs=t.oneOffs>0?t.oneOffs-1:0),t.list.splice(l,1)):i||(t.list[l][2]&&(o=T(t.list[l][2]),p(t.namespaces,o,o.length)),t.list[l][1]&&(t.oneOffs=t.oneOffs>0?t.oneOffs-1:0),t.list.splice(l,1)))}else if(!s&&i>0&&l>0)for(;--l>=0;)t.list[l][2]&&a(t.list[l][2],e,i)&&(o=T(t.list[l][2]),p(t.namespaces,o,o.length),t.list[l][1]&&(t.oneOffs=t.oneOffs>0?t.oneOffs-1:0),t.list.splice(l,1));else!s&&l>0&&(t.list=[],t.oneOffs=0,t.namespaces={})}function d(t,s,n,e){if(s){n=i(t,n);var o,l,p,a,r,u,c=n[1].join(j),f=n[2],g=c.length,h=f.length;if(n=n[0].join(w),r=n.length,p=r?"tp_"+n:!1,a=g?"tg_"+c:!1,u=!(!e||"function"!=typeof e),u||(e=null),r&&s.topics[O](p))g&&s.topics[p].tags[O](a)?(_(s.topics[p].tags[a],u,e,f,h),s.topics[p].tags[a].list.length||delete s.topics[p].tags[a]):g||_(s.topics[p].notags,u,e,f,h),s.topics[p].notags.list.length||T(s.topics[p].tags).length||delete s.topics[p];else if(!r&&(g||h))if(g){s.notopics.tags[O](a)&&(_(s.notopics.tags[a],u,e,f,h),s.notopics.tags[a].list.length||delete s.notopics.tags[a]);for(o in s.topics)s.topics[O](o)&&s.topics[o].tags[O](a)&&(_(s.topics[o].tags[a],u,e,f,h),s.topics[o].tags[a].list.length||delete s.topics[o].tags[a])}else{_(s.notopics.notags,u,e,f,h);for(l in s.notopics.tags)s.notopics.tags[O](l)&&(_(s.notopics.tags[l],u,e,f,h),s.notopics.tags[l].list.length||delete s.notopics.tags[l]);for(o in s.topics)if(s.topics[O](o)){_(s.topics[o].notags,u,e,f,h);for(l in s.topics[o].tags)s.topics[o].tags[O](l)&&(_(s.topics[o].tags[l],u,e,f,h),s.topics[o].tags[l].list.length||delete s.topics[o].tags[l])}}}}var m="0.4",v="prototype",O="hasOwnProperty",y="/",$="#",x="@",w="/",j="#",T=Object.keys,S=Date.now?Date.now:function(){return(new Date).getTime()};t[v]={constructor:t,dispose:function(t){if(t)for(var s=0;s<t.length;s++)this[t[s]]=null;return this}},s[v]={constructor:s,target:null,topic:null,originalTopic:null,tags:null,namespaces:null,data:null,timestamp:0,is_pipelined:!1,_next:null,_propagates:!0,_stopped:!1,_aborted:!1,dispose:function(){var s=this;return s.target=null,s.topic=null,s.originalTopic=null,s.tags=null,s.namespaces=null,s.data instanceof t&&s.data.dispose(),s.data=null,s.timestamp=null,s.is_pipelined=!1,s._propagates=!0,s._stopped=!0,s._aborted=!1,s._next=null,s},next:function(){return"function"==typeof this._next&&this._next(this),this},pipeline:function(t){return arguments.length||(t=null),"function"==typeof t?(this._next=t,this.is_pipelined=!0):(this._next=null,this.is_pipelined=!1),this},propagate:function(t){return arguments.length||(t=!0),this._propagates=!!t,this},stop:function(t){return arguments.length||(t=!0),this._stopped=!!t,this},abort:function(t){return arguments.length||(t=!0),this._aborted=!!t,this},aborted:function(){return this._aborted},propagates:function(){return this._propagates},stopped:function(){return this._stopped}};var D=function(){return this instanceof D?void this.initPubSub():new D};return D.VERSION=m,D.Event=s,D.Data=function(s){return new t(s)},D[v]={constructor:D,_seps:null,_pubsub$:null,initPubSub:function(){var t=this;return t._seps=[y,$,x],t._pubsub$=n(),t},disposePubSub:function(){var t=this;return t._seps=null,t._pubsub$=null,t},setSeparators:function(t){var s,n=this;return t&&(s=t.length)&&(s>0&&t[0]&&(n._seps[0]=t[0]),s>1&&t[1]&&(n._seps[1]=t[1]),s>2&&t[2]&&(n._seps[2]=t[2])),n},trigger:function(t,s,n){var e=this;return 3>arguments.length&&(n=0),n=+n,s=s||{},n>0?setTimeout(function(){f(e,e._seps,e._pubsub$,t,s)},n):f(e,e._seps,e._pubsub$,t,s),e},pipeline:function(t,s,n,e){var i=this;return 4>arguments.length&&(e=0),e=+e,s=s||{},e>0?setTimeout(function(){h(i,i._seps,i._pubsub$,t,s,n||null)},e):h(i,i._seps,i._pubsub$,t,s,n||null),i},on:function(t,s){var n=this;return s&&"function"==typeof s&&b(n._seps,n._pubsub$,t,s),n},one:function(t,s){var n=this;return s&&"function"==typeof s&&b(n._seps,n._pubsub$,t,s,!0),n},on1:function(t,s){var n=this;return s&&"function"==typeof s&&b(n._seps,n._pubsub$,t,s,!1,!0),n},one1:function(t,s){var n=this;return s&&"function"==typeof s&&b(n._seps,n._pubsub$,t,s,!0,!0),n},off:function(t,s){var n=this;return d(n._seps,n._pubsub$,t,s||null),n}},D});