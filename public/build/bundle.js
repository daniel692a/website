
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal$1(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.50.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Header.svelte generated by Svelte v3.50.1 */
    const file$b = "src/components/Header.svelte";

    function create_fragment$c(ctx) {
    	let header;
    	let nav;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let section;
    	let span0;
    	let t6;
    	let span1;
    	let t7;
    	let span2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "About";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Projects";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Contact";
    			t5 = space();
    			section = element("section");
    			span0 = element("span");
    			t6 = space();
    			span1 = element("span");
    			t7 = space();
    			span2 = element("span");
    			attr_dev(a0, "href", "#about");
    			attr_dev(a0, "class", "svelte-1vspflm");
    			add_location(a0, file$b, 23, 16, 578);
    			attr_dev(li0, "class", "svelte-1vspflm");
    			add_location(li0, file$b, 23, 12, 574);
    			attr_dev(a1, "href", "#projects");
    			attr_dev(a1, "class", "svelte-1vspflm");
    			add_location(a1, file$b, 24, 16, 647);
    			attr_dev(li1, "class", "svelte-1vspflm");
    			add_location(li1, file$b, 24, 12, 643);
    			attr_dev(a2, "href", "#contact");
    			attr_dev(a2, "class", "svelte-1vspflm");
    			add_location(a2, file$b, 25, 16, 722);
    			attr_dev(li2, "class", "svelte-1vspflm");
    			add_location(li2, file$b, 25, 12, 718);
    			attr_dev(ul, "class", "nav-menu svelte-1vspflm");
    			toggle_class(ul, "active", /*openMenu*/ ctx[2] === true);
    			add_location(ul, file$b, 22, 8, 487);
    			attr_dev(span0, "class", "bar svelte-1vspflm");
    			toggle_class(span0, "move1", /*openMenu*/ ctx[2] === true);
    			add_location(span0, file$b, 28, 12, 881);
    			attr_dev(span1, "class", "bar svelte-1vspflm");
    			toggle_class(span1, "enable", /*openMenu*/ ctx[2] === true);
    			add_location(span1, file$b, 29, 12, 951);
    			attr_dev(span2, "class", "bar svelte-1vspflm");
    			toggle_class(span2, "move2", /*openMenu*/ ctx[2] === true);
    			add_location(span2, file$b, 30, 12, 1022);
    			attr_dev(section, "class", "hamburger svelte-1vspflm");
    			attr_dev(section, "aria-label", "Menu");
    			add_location(section, file$b, 27, 8, 801);
    			add_location(nav, file$b, 21, 4, 473);
    			attr_dev(header, "class", "svelte-1vspflm");
    			add_location(header, file$b, 20, 0, 460);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			/*ul_binding*/ ctx[4](ul);
    			append_dev(nav, t5);
    			append_dev(nav, section);
    			append_dev(section, span0);
    			append_dev(section, t6);
    			append_dev(section, span1);
    			append_dev(section, t7);
    			append_dev(section, span2);
    			/*section_binding*/ ctx[5](section);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*closeMenu*/ ctx[3], false, false, false),
    					listen_dev(a1, "click", /*closeMenu*/ ctx[3], false, false, false),
    					listen_dev(a2, "click", /*closeMenu*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*openMenu*/ 4) {
    				toggle_class(ul, "active", /*openMenu*/ ctx[2] === true);
    			}

    			if (dirty & /*openMenu*/ 4) {
    				toggle_class(span0, "move1", /*openMenu*/ ctx[2] === true);
    			}

    			if (dirty & /*openMenu*/ 4) {
    				toggle_class(span1, "enable", /*openMenu*/ ctx[2] === true);
    			}

    			if (dirty & /*openMenu*/ 4) {
    				toggle_class(span2, "move2", /*openMenu*/ ctx[2] === true);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			/*ul_binding*/ ctx[4](null);
    			/*section_binding*/ ctx[5](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let hamburger, navMenu;
    	let openMenu = false;

    	const closeMenu = () => {
    		$$invalidate(2, openMenu = false);
    		mobileMenu();
    	};

    	onMount(() => {
    		const mobileMenu = () => {
    			if (openMenu === false) {
    				$$invalidate(2, openMenu = true);
    			} else {
    				$$invalidate(2, openMenu = false);
    			}
    		};

    		hamburger.addEventListener('click', mobileMenu);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			navMenu = $$value;
    			$$invalidate(1, navMenu);
    		});
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			hamburger = $$value;
    			$$invalidate(0, hamburger);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		hamburger,
    		navMenu,
    		openMenu,
    		closeMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ('hamburger' in $$props) $$invalidate(0, hamburger = $$props.hamburger);
    		if ('navMenu' in $$props) $$invalidate(1, navMenu = $$props.navMenu);
    		if ('openMenu' in $$props) $$invalidate(2, openMenu = $$props.openMenu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [hamburger, navMenu, openMenu, closeMenu, ul_binding, section_binding];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$c, create_fragment$c, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    var ProfilePicture = "2d7399733d891dc9.jpg";

    /* src/Profile.svelte generated by Svelte v3.50.1 */
    const file$a = "src/Profile.svelte";

    function create_fragment$b(ctx) {
    	let section1;
    	let figure;
    	let img;
    	let img_src_value;
    	let t0;
    	let section0;
    	let h2;
    	let t2;
    	let h40;
    	let t4;
    	let h41;

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			figure = element("figure");
    			img = element("img");
    			t0 = space();
    			section0 = element("section");
    			h2 = element("h2");
    			h2.textContent = "Daniel Armas Ramírez";
    			t2 = space();
    			h40 = element("h4");
    			h40.textContent = "Christian";
    			t4 = space();
    			h41 = element("h4");
    			h41.textContent = "Computer/Data Science";
    			if (!src_url_equal(img.src, img_src_value = ProfilePicture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Daniel's picture");
    			attr_dev(img, "class", "svelte-a34wl0");
    			add_location(img, file$a, 6, 8, 127);
    			attr_dev(figure, "class", "svelte-a34wl0");
    			add_location(figure, file$a, 5, 4, 110);
    			attr_dev(h2, "class", "svelte-a34wl0");
    			add_location(h2, file$a, 9, 8, 227);
    			attr_dev(h40, "class", "svelte-a34wl0");
    			add_location(h40, file$a, 10, 8, 265);
    			attr_dev(h41, "class", "svelte-a34wl0");
    			add_location(h41, file$a, 11, 8, 292);
    			attr_dev(section0, "class", "intro svelte-a34wl0");
    			add_location(section0, file$a, 8, 4, 195);
    			attr_dev(section1, "class", "presentation svelte-a34wl0");
    			add_location(section1, file$a, 4, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, figure);
    			append_dev(figure, img);
    			append_dev(section1, t0);
    			append_dev(section1, section0);
    			append_dev(section0, h2);
    			append_dev(section0, t2);
    			append_dev(section0, h40);
    			append_dev(section0, t4);
    			append_dev(section0, h41);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Profile', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ProfilePicture });
    	return [];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$b, create_fragment$b, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* node_modules/svelte-c-reveal/src/Reveal.svelte generated by Svelte v3.50.1 */
    const file$9 = "node_modules/svelte-c-reveal/src/Reveal.svelte";

    function create_fragment$a(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let rev_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty('hide svelte-c-reveal ' + /*cssClass*/ ctx[4]) + " svelte-19ttgh6"));
    			add_location(div0, file$9, 262, 4, 5937);
    			attr_dev(div1, "class", "wrapper svelte-19ttgh6");
    			add_location(div1, file$9, 258, 0, 5783);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(rev_action = /*rev*/ ctx[5].call(null, div1, {
    						duration: /*duration*/ ctx[0],
    						delay: /*delay*/ ctx[1]
    					})),
    					listen_dev(div1, "in", /*in_handler*/ ctx[9], false, false, false),
    					listen_dev(div1, "out", /*out_handler*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*cssClass*/ 16 && div0_class_value !== (div0_class_value = "" + (null_to_empty('hide svelte-c-reveal ' + /*cssClass*/ ctx[4]) + " svelte-19ttgh6"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (rev_action && is_function(rev_action.update) && dirty & /*duration, delay*/ 3) rev_action.update.call(null, {
    				duration: /*duration*/ ctx[0],
    				delay: /*delay*/ ctx[1]
    			});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Reveal', slots, ['default']);
    	let { trigger = 0.0 } = $$props;
    	let { duration = 0.4 } = $$props;
    	let { delay = 0 } = $$props;
    	let { reveal = "fadeIn" } = $$props;
    	let { hide = "" } = $$props;
    	let cssClass = "";

    	// Action -----------------
    	function rev(node, args) {
    		let revealNode = node.querySelector(".svelte-c-reveal");
    		revealNode.style.setProperty("--animation-delay", args.delay + "s");
    		revealNode.style.setProperty("--animation-duration", args.duration + "s");

    		// Anim settings
    		const handler = (entries, observer) => {
    			entries.forEach(entry => {
    				if (entry.isIntersecting) {
    					entry.target.dispatchEvent(new CustomEvent("in"));

    					if (hide === "") {
    						observer.disconnect();
    					}
    				} else {
    					if (hide !== "") {
    						entry.target.dispatchEvent(new CustomEvent("out"));
    					}
    				}
    			});
    		};

    		let _trigger = 100 * trigger;

    		const observer = new IntersectionObserver(handler,
    		{
    				root: null,
    				rootMargin: `0% 0% -${_trigger}% 0%`,
    				threshold: 0
    			});

    		// Observe
    		observer.observe(node);

    		// Return
    		return {
    			destroy(observer) {
    				observer.disconnect();
    			}
    		};
    	}

    	const writable_props = ['trigger', 'duration', 'delay', 'reveal', 'hide'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Reveal> was created with unknown prop '${key}'`);
    	});

    	const in_handler = e => $$invalidate(4, cssClass = reveal);
    	const out_handler = e => $$invalidate(4, cssClass = hide);

    	$$self.$$set = $$props => {
    		if ('trigger' in $$props) $$invalidate(6, trigger = $$props.trigger);
    		if ('duration' in $$props) $$invalidate(0, duration = $$props.duration);
    		if ('delay' in $$props) $$invalidate(1, delay = $$props.delay);
    		if ('reveal' in $$props) $$invalidate(2, reveal = $$props.reveal);
    		if ('hide' in $$props) $$invalidate(3, hide = $$props.hide);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		trigger,
    		duration,
    		delay,
    		reveal,
    		hide,
    		cssClass,
    		rev
    	});

    	$$self.$inject_state = $$props => {
    		if ('trigger' in $$props) $$invalidate(6, trigger = $$props.trigger);
    		if ('duration' in $$props) $$invalidate(0, duration = $$props.duration);
    		if ('delay' in $$props) $$invalidate(1, delay = $$props.delay);
    		if ('reveal' in $$props) $$invalidate(2, reveal = $$props.reveal);
    		if ('hide' in $$props) $$invalidate(3, hide = $$props.hide);
    		if ('cssClass' in $$props) $$invalidate(4, cssClass = $$props.cssClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		duration,
    		delay,
    		reveal,
    		hide,
    		cssClass,
    		rev,
    		trigger,
    		$$scope,
    		slots,
    		in_handler,
    		out_handler
    	];
    }

    class Reveal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$a, create_fragment$a, safe_not_equal$1, {
    			trigger: 6,
    			duration: 0,
    			delay: 1,
    			reveal: 2,
    			hide: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reveal",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get trigger() {
    		throw new Error("<Reveal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trigger(value) {
    		throw new Error("<Reveal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Reveal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Reveal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delay() {
    		throw new Error("<Reveal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delay(value) {
    		throw new Error("<Reveal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reveal() {
    		throw new Error("<Reveal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reveal(value) {
    		throw new Error("<Reveal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hide() {
    		throw new Error("<Reveal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hide(value) {
    		throw new Error("<Reveal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Coding$1 = "ec0b9ba40fcab24b.png";

    /* src/components/Subtitle.svelte generated by Svelte v3.50.1 */

    const file$8 = "src/components/Subtitle.svelte";

    function create_fragment$9(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(/*content*/ ctx[0]);
    			attr_dev(h2, "class", "svelte-11fq3b6");
    			add_location(h2, file$8, 4, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content*/ 1) set_data_dev(t, /*content*/ ctx[0]);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Subtitle', slots, []);
    	let { content } = $$props;
    	const writable_props = ['content'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Subtitle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    	};

    	$$self.$capture_state = () => ({ content });

    	$$self.$inject_state = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content];
    }

    class Subtitle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$9, create_fragment$9, safe_not_equal$1, { content: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Subtitle",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[0] === undefined && !('content' in props)) {
    			console.warn("<Subtitle> was created without expected prop 'content'");
    		}
    	}

    	get content() {
    		throw new Error("<Subtitle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<Subtitle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/About.svelte generated by Svelte v3.50.1 */
    const file$7 = "src/About.svelte";

    // (9:4) <Reveal duration="1" reveal="fadeInLeft">
    function create_default_slot$1(ctx) {
    	let section;
    	let figure;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p;
    	let t1;
    	let br0;
    	let t2;
    	let i0;
    	let t4;
    	let a0;
    	let t6;
    	let a1;
    	let t8;
    	let i1;
    	let br1;
    	let t10;
    	let i2;
    	let t12;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			figure = element("figure");
    			img0 = element("img");
    			t0 = space();
    			p = element("p");
    			t1 = text("Incoming Explore intern at @Microsoft");
    			br0 = element("br");
    			t2 = text("Hello everyone, my name is Daniel, I'm a software developer based in ");
    			i0 = element("i");
    			i0.textContent = "Mexico";
    			t4 = text(", ");
    			a0 = element("a");
    			a0.textContent = "Microsoft Learn Student Ambassador";
    			t6 = text(" and Data science student at ");
    			a1 = element("a");
    			a1.textContent = "ESCOM-IPN";
    			t8 = text(", I'm passionate about the world of computer science, especially ");
    			i1 = element("i");
    			i1.textContent = "data science and competitive programming.";
    			br1 = element("br");
    			t10 = text("\n            I'm currently practicing for ");
    			i2 = element("i");
    			i2.textContent = "programming contests";
    			t12 = text(", and I also collaborate in both local and national software communities. My dream is to be a Machine Learning engineer.");
    			img1 = element("img");
    			if (!src_url_equal(img0.src, img0_src_value = Coding$1)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Desk with a computer");
    			attr_dev(img0, "class", "svelte-a45uue");
    			add_location(img0, file$7, 11, 16, 343);
    			attr_dev(figure, "class", "svelte-a45uue");
    			add_location(figure, file$7, 10, 12, 318);
    			add_location(br0, file$7, 13, 52, 465);
    			add_location(i0, file$7, 13, 125, 538);
    			attr_dev(a0, "href", "https://studentambassadors.microsoft.com/en-US/studentambassadors/profile/55d8101f-bd94-410a-829c-5a615a72bdbd");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener noreferrer");
    			attr_dev(a0, "class", "svelte-a45uue");
    			add_location(a0, file$7, 13, 140, 553);
    			attr_dev(a1, "href", "https://www.escom.ipn.mx/");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			attr_dev(a1, "class", "svelte-a45uue");
    			add_location(a1, file$7, 13, 370, 783);
    			add_location(i1, file$7, 13, 526, 939);
    			add_location(br1, file$7, 13, 574, 987);
    			add_location(i2, file$7, 14, 41, 1033);
    			if (!src_url_equal(img1.src, img1_src_value = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Eyes.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Eyes");
    			attr_dev(img1, "width", "25");
    			attr_dev(img1, "height", "25");
    			attr_dev(img1, "class", "svelte-a45uue");
    			add_location(img1, file$7, 14, 188, 1180);
    			attr_dev(p, "class", "svelte-a45uue");
    			add_location(p, file$7, 13, 12, 425);
    			attr_dev(section, "class", "descrip svelte-a45uue");
    			add_location(section, file$7, 9, 8, 280);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, figure);
    			append_dev(figure, img0);
    			append_dev(section, t0);
    			append_dev(section, p);
    			append_dev(p, t1);
    			append_dev(p, br0);
    			append_dev(p, t2);
    			append_dev(p, i0);
    			append_dev(p, t4);
    			append_dev(p, a0);
    			append_dev(p, t6);
    			append_dev(p, a1);
    			append_dev(p, t8);
    			append_dev(p, i1);
    			append_dev(p, br1);
    			append_dev(p, t10);
    			append_dev(p, i2);
    			append_dev(p, t12);
    			append_dev(p, img1);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(9:4) <Reveal duration=\\\"1\\\" reveal=\\\"fadeInLeft\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let subtitle;
    	let t;
    	let reveal;
    	let current;

    	subtitle = new Subtitle({
    			props: { content: "About" },
    			$$inline: true
    		});

    	reveal = new Reveal({
    			props: {
    				duration: "1",
    				reveal: "fadeInLeft",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(subtitle.$$.fragment);
    			t = space();
    			create_component(reveal.$$.fragment);
    			attr_dev(section, "id", "about");
    			attr_dev(section, "class", "svelte-a45uue");
    			add_location(section, file$7, 6, 0, 162);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(subtitle, section, null);
    			append_dev(section, t);
    			mount_component(reveal, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const reveal_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				reveal_changes.$$scope = { dirty, ctx };
    			}

    			reveal.$set(reveal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subtitle.$$.fragment, local);
    			transition_in(reveal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subtitle.$$.fragment, local);
    			transition_out(reveal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(subtitle);
    			destroy_component(reveal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Reveal, Coding: Coding$1, Subtitle });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$8, create_fragment$8, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    var JavaScript = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%20%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22256px%22%20viewBox%3D%220%200%20256%20256%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M0%2C0%20L256%2C0%20L256%2C256%20L0%2C256%20L0%2C0%20Z%22%20fill%3D%22%23F7DF1E%22%3E%3C%2Fpath%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M67.311746%2C213.932292%20L86.902654%2C202.076241%20C90.6821079%2C208.777346%2094.1202286%2C214.447137%20102.367086%2C214.447137%20C110.272203%2C214.447137%20115.256076%2C211.354819%20115.256076%2C199.326883%20L115.256076%2C117.528787%20L139.313575%2C117.528787%20L139.313575%2C199.666997%20C139.313575%2C224.58433%20124.707759%2C235.925943%20103.3984%2C235.925943%20C84.1532952%2C235.925943%2072.9819429%2C225.958603%2067.3113397%2C213.93026%22%20fill%3D%22%23000000%22%3E%3C%2Fpath%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M152.380952%2C211.354413%20L171.969422%2C200.0128%20C177.125994%2C208.433981%20183.827911%2C214.619835%20195.684368%2C214.619835%20C205.652521%2C214.619835%20212.009041%2C209.635962%20212.009041%2C202.762159%20C212.009041%2C194.513676%20205.479416%2C191.592025%20194.481168%2C186.78207%20L188.468419%2C184.202565%20C171.111213%2C176.81473%20159.597308%2C167.53534%20159.597308%2C147.944838%20C159.597308%2C129.901308%20173.344508%2C116.153295%20194.825752%2C116.153295%20C210.119924%2C116.153295%20221.117765%2C121.48094%20229.021663%2C135.400432%20L210.29059%2C147.428775%20C206.166146%2C140.040127%20201.699556%2C137.119289%20194.826159%2C137.119289%20C187.78047%2C137.119289%20183.312254%2C141.587098%20183.312254%2C147.428775%20C183.312254%2C154.646349%20187.78047%2C157.568406%20198.089956%2C162.036622%20L204.103924%2C164.614095%20C224.553448%2C173.378641%20236.067352%2C182.313448%20236.067352%2C202.418387%20C236.067352%2C224.071924%20219.055137%2C235.927975%20196.200432%2C235.927975%20C173.860978%2C235.927975%20159.425829%2C225.274311%20152.381359%2C211.354413%22%20fill%3D%22%23000000%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var Python = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%20%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22255px%22%20viewBox%3D%220%200%20256%20255%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cdefs%3E%20%20%20%20%20%20%20%20%3ClinearGradient%20x1%3D%2212.9593594%25%22%20y1%3D%2212.0393928%25%22%20x2%3D%2279.6388325%25%22%20y2%3D%2278.2008538%25%22%20id%3D%22linearGradient-1%22%3E%20%20%20%20%20%20%20%20%20%20%20%20%3Cstop%20stop-color%3D%22%23387EB8%22%20offset%3D%220%25%22%3E%3C%2Fstop%3E%20%20%20%20%20%20%20%20%20%20%20%20%3Cstop%20stop-color%3D%22%23366994%22%20offset%3D%22100%25%22%3E%3C%2Fstop%3E%20%20%20%20%20%20%20%20%3C%2FlinearGradient%3E%20%20%20%20%20%20%20%20%3ClinearGradient%20x1%3D%2219.127525%25%22%20y1%3D%2220.5791813%25%22%20x2%3D%2290.7415328%25%22%20y2%3D%2288.4290372%25%22%20id%3D%22linearGradient-2%22%3E%20%20%20%20%20%20%20%20%20%20%20%20%3Cstop%20stop-color%3D%22%23FFE052%22%20offset%3D%220%25%22%3E%3C%2Fstop%3E%20%20%20%20%20%20%20%20%20%20%20%20%3Cstop%20stop-color%3D%22%23FFC331%22%20offset%3D%22100%25%22%3E%3C%2Fstop%3E%20%20%20%20%20%20%20%20%3C%2FlinearGradient%3E%20%20%20%20%3C%2Fdefs%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M126.915866%2C0.0722755491%20C62.0835831%2C0.0722801733%2066.1321288%2C28.1874648%2066.1321288%2C28.1874648%20L66.2044043%2C57.3145115%20L128.072276%2C57.3145115%20L128.072276%2C66.0598532%20L41.6307171%2C66.0598532%20C41.6307171%2C66.0598532%200.144551098%2C61.3549438%200.144551098%2C126.771315%20C0.144546474%2C192.187673%2036.3546019%2C189.867871%2036.3546019%2C189.867871%20L57.9649915%2C189.867871%20L57.9649915%2C159.51214%20C57.9649915%2C159.51214%2056.8001363%2C123.302089%2093.5968379%2C123.302089%20L154.95878%2C123.302089%20C154.95878%2C123.302089%20189.434218%2C123.859386%20189.434218%2C89.9830604%20L189.434218%2C33.9695088%20C189.434218%2C33.9695041%20194.668541%2C0.0722755491%20126.915866%2C0.0722755491%20L126.915866%2C0.0722755491%20L126.915866%2C0.0722755491%20Z%20M92.8018069%2C19.6589497%20C98.9572068%2C19.6589452%20103.932242%2C24.6339846%20103.932242%2C30.7893845%20C103.932246%2C36.9447844%2098.9572068%2C41.9198193%2092.8018069%2C41.9198193%20C86.646407%2C41.9198239%2081.6713721%2C36.9447844%2081.6713721%2C30.7893845%20C81.6713674%2C24.6339846%2086.646407%2C19.6589497%2092.8018069%2C19.6589497%20L92.8018069%2C19.6589497%20L92.8018069%2C19.6589497%20Z%22%20fill%3D%22url%28%23linearGradient-1%29%22%3E%3C%2Fpath%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M128.757101%2C254.126271%20C193.589403%2C254.126271%20189.540839%2C226.011081%20189.540839%2C226.011081%20L189.468564%2C196.884035%20L127.600692%2C196.884035%20L127.600692%2C188.138693%20L214.042251%2C188.138693%20C214.042251%2C188.138693%20255.528417%2C192.843589%20255.528417%2C127.427208%20C255.52844%2C62.0108566%20219.318366%2C64.3306589%20219.318366%2C64.3306589%20L197.707976%2C64.3306589%20L197.707976%2C94.6863832%20C197.707976%2C94.6863832%20198.87285%2C130.896434%20162.07613%2C130.896434%20L100.714182%2C130.896434%20C100.714182%2C130.896434%2066.238745%2C130.339138%2066.238745%2C164.215486%20L66.238745%2C220.229038%20C66.238745%2C220.229038%2061.0044225%2C254.126271%20128.757101%2C254.126271%20L128.757101%2C254.126271%20L128.757101%2C254.126271%20Z%20M162.87116%2C234.539597%20C156.715759%2C234.539597%20151.740726%2C229.564564%20151.740726%2C223.409162%20C151.740726%2C217.253759%20156.715759%2C212.278727%20162.87116%2C212.278727%20C169.026563%2C212.278727%20174.001595%2C217.253759%20174.001595%2C223.409162%20C174.001618%2C229.564564%20169.026563%2C234.539597%20162.87116%2C234.539597%20L162.87116%2C234.539597%20L162.87116%2C234.539597%20Z%22%20fill%3D%22url%28%23linearGradient-2%29%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var Cplusplus = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22288px%22%20viewBox%3D%220%200%20256%20288%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%3Cg%3E%20%20%3Cpath%20d%3D%22M255.569%2C84.72%20C255.567%2C79.89%20254.534%2C75.622%20252.445%2C71.959%20C250.393%2C68.357%20247.32%2C65.338%20243.198%2C62.951%20C209.173%2C43.332%20175.115%2C23.773%20141.101%2C4.134%20C131.931%2C-1.16%20123.04%2C-0.967%20113.938%2C4.403%20C100.395%2C12.39%2032.59%2C51.237%2012.385%2C62.94%20C4.064%2C67.757%200.015%2C75.129%200.013%2C84.711%20C0%2C124.166%200.013%2C163.62%200%2C203.076%20C0.002%2C207.8%200.991%2C211.985%202.988%2C215.593%20C5.041%2C219.304%208.157%2C222.406%2012.374%2C224.847%20C32.58%2C236.55%20100.394%2C275.394%20113.934%2C283.383%20C123.04%2C288.756%20131.931%2C288.948%20141.104%2C283.652%20C175.119%2C264.012%20209.179%2C244.454%20243.209%2C224.835%20C247.426%2C222.395%20250.542%2C219.291%20252.595%2C215.583%20C254.589%2C211.975%20255.58%2C207.79%20255.582%2C203.065%20C255.582%2C203.065%20255.582%2C124.176%20255.569%2C84.72%22%20fill%3D%22%235C8DBC%22%3E%3C%2Fpath%3E%20%20%3Cpath%20d%3D%22M128.182%2C143.509%20L2.988%2C215.593%20C5.041%2C219.304%208.157%2C222.406%2012.374%2C224.847%20C32.58%2C236.55%20100.394%2C275.394%20113.934%2C283.383%20C123.04%2C288.756%20131.931%2C288.948%20141.104%2C283.652%20C175.119%2C264.012%20209.179%2C244.454%20243.209%2C224.835%20C247.426%2C222.395%20250.542%2C219.291%20252.595%2C215.583%20L128.182%2C143.509%22%20fill%3D%22%231A4674%22%3E%3C%2Fpath%3E%20%20%3Cpath%20d%3D%22M91.101%2C164.861%20C98.386%2C177.579%20112.081%2C186.157%20127.791%2C186.157%20C143.598%2C186.157%20157.371%2C177.47%20164.619%2C164.616%20L128.182%2C143.509%20L91.101%2C164.861%22%20fill%3D%22%231A4674%22%3E%3C%2Fpath%3E%20%20%3Cpath%20d%3D%22M255.569%2C84.72%20C255.567%2C79.89%20254.534%2C75.622%20252.445%2C71.959%20L128.182%2C143.509%20L252.595%2C215.583%20C254.589%2C211.975%20255.58%2C207.79%20255.582%2C203.065%20C255.582%2C203.065%20255.582%2C124.176%20255.569%2C84.72%22%20fill%3D%22%231B598E%22%3E%3C%2Fpath%3E%20%20%3Cpath%20d%3D%22M248.728%2C148.661%20L239.006%2C148.661%20L239.006%2C158.385%20L229.282%2C158.385%20L229.282%2C148.661%20L219.561%2C148.661%20L219.561%2C138.94%20L229.282%2C138.94%20L229.282%2C129.218%20L239.006%2C129.218%20L239.006%2C138.94%20L248.728%2C138.94%20L248.728%2C148.661%22%20fill%3D%22%23FFFFFF%22%3E%3C%2Fpath%3E%20%20%3Cpath%20d%3D%22M213.253%2C148.661%20L203.532%2C148.661%20L203.532%2C158.385%20L193.81%2C158.385%20L193.81%2C148.661%20L184.088%2C148.661%20L184.088%2C138.94%20L193.81%2C138.94%20L193.81%2C129.218%20L203.532%2C129.218%20L203.532%2C138.94%20L213.253%2C138.94%20L213.253%2C148.661%22%20fill%3D%22%23FFFFFF%22%3E%3C%2Fpath%3E%20%20%3Cpath%20d%3D%22M164.619%2C164.616%20C157.371%2C177.47%20143.598%2C186.157%20127.791%2C186.157%20C112.081%2C186.157%2098.386%2C177.579%2091.101%2C164.861%20C87.562%2C158.681%2085.527%2C151.526%2085.527%2C143.893%20C85.527%2C120.552%20104.45%2C101.63%20127.791%2C101.63%20C143.4%2C101.63%20157.023%2C110.101%20164.344%2C122.689%20L201.285%2C101.417%20C186.602%2C76.071%20159.189%2C59.019%20127.791%2C59.019%20C80.915%2C59.019%2042.916%2C97.019%2042.916%2C143.893%20C42.916%2C159.271%2047.007%2C173.692%2054.157%2C186.131%20C68.803%2C211.611%2096.294%2C228.768%20127.791%2C228.768%20C159.346%2C228.768%20186.88%2C211.542%20201.505%2C185.987%20L164.619%2C164.616%22%20fill%3D%22%23FFFFFF%22%3E%3C%2Fpath%3E%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var Svelte = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22308px%22%20viewBox%3D%220%200%20256%20308%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%3Cpath%20d%3D%22M239.681566%2C40.706757%20C211.113272%2C-0.181889366%20154.69089%2C-12.301439%20113.894816%2C13.6910393%20L42.2469062%2C59.3555354%20C22.6760042%2C71.6680028%209.1958152%2C91.6538543%205.11196889%2C114.412133%20C1.69420521%2C133.371174%204.6982178%2C152.928576%2013.6483951%2C169.987905%20C7.51549676%2C179.291145%203.33259428%2C189.7413%201.3524912%2C200.706787%20C-2.77083771%2C223.902098%202.62286977%2C247.780539%2016.3159596%2C266.951444%20C44.8902975%2C307.843936%20101.312954%2C319.958266%20142.10271%2C293.967161%20L213.75062%2C248.302665%20C233.322905%2C235.991626%20246.803553%2C216.005094%20250.885557%2C193.246067%20C254.302867%2C174.287249%20251.30121%2C154.730228%20242.355449%2C137.668922%20C248.486748%2C128.365895%20252.667894%2C117.916162%20254.646134%2C106.951413%20C258.772188%2C83.7560394%20253.378243%2C59.8765465%20239.682665%2C40.706757%22%20fill%3D%22%23FF3E00%22%3E%3C%2Fpath%3E%20%20%20%20%3Cpath%20d%3D%22M106.888658%2C270.841265%20C83.7871855%2C276.848065%2059.3915045%2C267.805346%2045.7864111%2C248.192566%20C37.5477583%2C236.66102%2034.3023491%2C222.296573%2036.7830958%2C208.343155%20C37.1989333%2C206.075414%2037.7711933%2C203.839165%2038.4957755%2C201.650433%20L39.845476%2C197.534835%20L43.5173097%2C200.231763%20C51.9971301%2C206.462491%2061.4784803%2C211.199728%2071.5527203%2C214.239302%20L74.2164003%2C215.047419%20L73.9710252%2C217.705878%20C73.6455499%2C221.487851%2074.6696022%2C225.262925%2076.8616703%2C228.361972%20C80.9560313%2C234.269749%2088.3011363%2C236.995968%2095.2584831%2C235.190159%20C96.8160691%2C234.773852%2098.3006859%2C234.121384%2099.6606718%2C233.25546%20L171.331634%2C187.582718%20C174.877468%2C185.349963%20177.321139%2C181.729229%20178.065299%2C177.605596%20C178.808171%2C173.400048%20177.830501%2C169.072361%20175.351884%2C165.594581%20C171.255076%2C159.685578%20163.908134%2C156.9582%20156.947927%2C158.762547%20C155.392392%2C159.178888%20153.90975%2C159.83088%20152.551509%2C160.695872%20L125.202489%2C178.130144%20C120.705281%2C180.989558%20115.797437%2C183.144784%20110.64897%2C184.521162%20C87.547692%2C190.527609%2063.1523949%2C181.484801%2049.5475471%2C161.872188%20C41.3085624%2C150.340895%2038.0631179%2C135.976391%2040.5442317%2C122.023052%20C43.0002744%2C108.333716%2051.1099574%2C96.3125326%2062.8835328%2C88.9089537%20L134.548175%2C43.2323647%20C139.047294%2C40.3682559%20143.958644%2C38.21032%20149.111311%2C36.8336525%20C172.21244%2C30.8273594%20196.607527%2C39.8700206%20210.212459%2C59.4823515%20C218.451112%2C71.013898%20221.696522%2C85.3783452%20219.215775%2C99.3317627%20C218.798144%2C101.59911%20218.225915%2C103.835236%20217.503095%2C106.024485%20L216.153395%2C110.140083%20L212.483484%2C107.447276%20C204.004261%2C101.212984%20194.522%2C96.4735732%20184.44615%2C93.4336926%20L181.78247%2C92.6253012%20L182.027845%2C89.9668419%20C182.350522%2C86.1852063%20181.326723%2C82.4111645%20179.1372%2C79.3110228%20C175.042839%2C73.4032457%20167.697734%2C70.677026%20160.740387%2C72.4828355%20C159.182801%2C72.8991426%20157.698185%2C73.5516104%20156.338199%2C74.4175344%20L84.6672364%2C120.0922%20C81.1218886%2C122.323199%2078.6795938%2C125.943704%2077.9387928%2C130.066574%20C77.1913232%2C134.271925%2078.1673502%2C138.601163%2080.6469865%2C142.078963%20C84.7438467%2C147.987899%2092.0907405%2C150.71526%2099.0509435%2C148.910997%20C100.608143%2C148.493836%20102.092543%2C147.841423%20103.452857%2C146.976298%20L130.798305%2C129.548621%20C135.293566%2C126.685437%20140.201191%2C124.528302%20145.350175%2C123.152382%20C168.451453%2C117.145935%20192.846751%2C126.188743%20206.451598%2C145.801356%20C214.690583%2C157.332649%20217.936027%2C171.697153%20215.454914%2C185.650492%20C212.997261%2C199.340539%20204.888162%2C211.362752%20193.115613%2C218.769811%20L121.450695%2C264.442553%20C116.951576%2C267.306662%20112.040226%2C269.464598%20106.887559%2C270.841265%22%20fill%3D%22%23FFFFFF%22%3E%3C%2Fpath%3E%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var React = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22228px%22%20viewBox%3D%220%200%20256%20228%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M210.483381%2C73.8236374%20C207.827698%2C72.9095503%20205.075867%2C72.0446761%20202.24247%2C71.2267368%20C202.708172%2C69.3261098%20203.135596%2C67.4500894%20203.515631%2C65.6059664%20C209.753843%2C35.3248922%20205.675082%2C10.9302478%20191.747328%2C2.89849283%20C178.392359%2C-4.80289661%20156.551327%2C3.22703567%20134.492936%2C22.4237776%20C132.371761%2C24.2697233%20130.244662%2C26.2241201%20128.118477%2C28.2723861%20C126.701777%2C26.917204%20125.287358%2C25.6075897%20123.876584%2C24.3549348%20C100.758745%2C3.82852863%2077.5866802%2C-4.82157937%2063.6725966%2C3.23341515%20C50.3303869%2C10.9571328%2046.3792156%2C33.8904224%2051.9945178%2C62.5880206%20C52.5367729%2C65.3599011%2053.1706189%2C68.1905639%2053.8873982%2C71.068617%20C50.6078941%2C71.9995641%2047.4418534%2C72.9920277%2044.4125156%2C74.0478303%20C17.3093297%2C83.497195%200%2C98.3066828%200%2C113.667995%20C0%2C129.533287%2018.5815786%2C145.446423%2046.8116526%2C155.095373%20C49.0394553%2C155.856809%2051.3511025%2C156.576778%2053.7333796%2C157.260293%20C52.9600965%2C160.37302%2052.2875179%2C163.423318%2051.7229345%2C166.398431%20C46.3687351%2C194.597975%2050.5500231%2C216.989464%2063.8566899%2C224.664425%20C77.6012619%2C232.590464%20100.66852%2C224.443422%20123.130185%2C204.809231%20C124.905501%2C203.257196%20126.687196%2C201.611293%20128.472081%2C199.886102%20C130.785552%2C202.113904%20133.095375%2C204.222319%20135.392897%2C206.199955%20C157.14963%2C224.922338%20178.637969%2C232.482469%20191.932332%2C224.786092%20C205.663234%2C216.837268%20210.125675%2C192.78347%20204.332202%2C163.5181%20C203.88974%2C161.283006%20203.374826%2C158.99961%20202.796573%2C156.675661%20C204.416503%2C156.196743%20206.006814%2C155.702335%20207.557482%2C155.188332%20C236.905331%2C145.46465%20256%2C129.745175%20256%2C113.667995%20C256%2C98.2510906%20238.132466%2C83.3418093%20210.483381%2C73.8236374%20L210.483381%2C73.8236374%20Z%20M204.118035%2C144.807565%20C202.718197%2C145.270987%20201.281904%2C145.718918%20199.818271%2C146.153177%20C196.578411%2C135.896354%20192.205739%2C124.989735%20186.854729%2C113.72131%20C191.961041%2C102.721277%20196.164656%2C91.9540963%20199.313837%2C81.7638014%20C201.93261%2C82.5215915%20204.474374%2C83.3208483%20206.923636%2C84.1643056%20C230.613348%2C92.3195488%20245.063763%2C104.377206%20245.063763%2C113.667995%20C245.063763%2C123.564379%20229.457753%2C136.411268%20204.118035%2C144.807565%20L204.118035%2C144.807565%20Z%20M193.603754%2C165.642007%20C196.165567%2C178.582766%20196.531475%2C190.282717%20194.834536%2C199.429057%20C193.309843%2C207.64764%20190.243595%2C213.12715%20186.452366%2C215.321689%20C178.384612%2C219.991462%20161.131788%2C213.921395%20142.525146%2C197.909832%20C140.392124%2C196.074366%20138.243609%2C194.114502%20136.088259%2C192.040261%20C143.301619%2C184.151133%20150.510878%2C174.979732%20157.54698%2C164.793993%20C169.922699%2C163.695814%20181.614905%2C161.900447%20192.218042%2C159.449363%20C192.740247%2C161.555956%20193.204126%2C163.621993%20193.603754%2C165.642007%20L193.603754%2C165.642007%20Z%20M87.2761866%2C214.514686%20C79.3938934%2C217.298414%2073.1160375%2C217.378157%2069.3211631%2C215.189998%20C61.2461189%2C210.532528%2057.8891498%2C192.554265%2062.4682434%2C168.438039%20C62.9927272%2C165.676183%2063.6170041%2C162.839142%2064.3365173%2C159.939216%20C74.8234575%2C162.258154%2086.4299951%2C163.926841%2098.8353334%2C164.932519%20C105.918826%2C174.899534%20113.336329%2C184.06091%20120.811247%2C192.08264%20C119.178102%2C193.65928%20117.551336%2C195.16028%20115.933685%2C196.574699%20C106.001303%2C205.256705%2096.0479605%2C211.41654%2087.2761866%2C214.514686%20L87.2761866%2C214.514686%20Z%20M50.3486141%2C144.746959%20C37.8658105%2C140.48046%2027.5570398%2C134.935332%2020.4908634%2C128.884403%20C14.1414664%2C123.446815%2010.9357817%2C118.048415%2010.9357817%2C113.667995%20C10.9357817%2C104.34622%2024.8334611%2C92.4562517%2048.0123604%2C84.3748281%20C50.8247961%2C83.3942121%2053.7689223%2C82.4701001%2056.8242337%2C81.6020363%20C60.0276398%2C92.0224477%2064.229889%2C102.917218%2069.3011135%2C113.93411%20C64.1642716%2C125.11459%2059.9023288%2C136.182975%2056.6674809%2C146.725506%20C54.489347%2C146.099407%2052.3791089%2C145.440499%2050.3486141%2C144.746959%20L50.3486141%2C144.746959%20Z%20M62.7270678%2C60.4878073%20C57.9160346%2C35.9004118%2061.1112387%2C17.3525532%2069.1516515%2C12.6982729%20C77.7160924%2C7.74005624%2096.6544653%2C14.8094222%20116.614922%2C32.5329619%20C117.890816%2C33.6657739%20119.171723%2C34.8514442%20120.456275%2C36.0781256%20C113.018267%2C44.0647686%20105.66866%2C53.1573386%2098.6480514%2C63.0655695%20C86.6081646%2C64.1815215%2075.0831931%2C65.9741531%2064.4868907%2C68.3746571%20C63.8206914%2C65.6948233%2063.2305903%2C63.0619242%2062.7270678%2C60.4878073%20L62.7270678%2C60.4878073%20Z%20M173.153901%2C87.7550367%20C170.620796%2C83.3796304%20168.020249%2C79.1076627%20165.369124%2C74.9523483%20C173.537126%2C75.9849113%20181.362914%2C77.3555864%20188.712066%2C79.0329319%20C186.505679%2C86.1041206%20183.755673%2C93.4974728%20180.518546%2C101.076741%20C178.196419%2C96.6680702%20175.740322%2C92.2229454%20173.153901%2C87.7550367%20L173.153901%2C87.7550367%20Z%20M128.122121%2C43.8938899%20C133.166461%2C49.3588189%20138.218091%2C55.4603279%20143.186789%2C62.0803968%20C138.179814%2C61.8439007%20133.110868%2C61.720868%20128.000001%2C61.720868%20C122.937434%2C61.720868%20117.905854%2C61.8411667%20112.929865%2C62.0735617%20C117.903575%2C55.515009%20122.99895%2C49.4217021%20128.122121%2C43.8938899%20L128.122121%2C43.8938899%20Z%20M82.8018984%2C87.830679%20C80.2715265%2C92.2183886%2077.8609975%2C96.6393627%2075.5753239%2C101.068539%20C72.3906004%2C93.5156998%2069.6661103%2C86.0886276%2067.440586%2C78.9171899%20C74.7446255%2C77.2826781%2082.5335049%2C75.9461789%2090.6495601%2C74.9332099%20C87.9610684%2C79.1268011%2085.3391054%2C83.4302106%2082.8018984%2C87.8297677%20L82.8018984%2C87.830679%20L82.8018984%2C87.830679%20Z%20M90.8833221%2C153.182899%20C82.4979621%2C152.247395%2074.5919739%2C150.979704%2067.289757%2C149.390303%20C69.5508242%2C142.09082%2072.3354636%2C134.505173%2075.5876271%2C126.789657%20C77.8792246%2C131.215644%2080.2993228%2C135.638441%2082.8451877%2C140.03572%20L82.8456433%2C140.03572%20C85.4388987%2C144.515476%2088.1255676%2C148.90364%2090.8833221%2C153.182899%20L90.8833221%2C153.182899%20Z%20M128.424691%2C184.213105%20C123.24137%2C178.620587%20118.071264%2C172.434323%20113.021912%2C165.780078%20C117.923624%2C165.972373%20122.921029%2C166.0708%20128.000001%2C166.0708%20C133.217953%2C166.0708%20138.376211%2C165.953235%20143.45336%2C165.727219%20C138.468257%2C172.501308%20133.434855%2C178.697141%20128.424691%2C184.213105%20L128.424691%2C184.213105%20Z%20M180.622896%2C126.396409%20C184.044571%2C134.195313%20186.929004%2C141.741317%20189.219234%2C148.9164%20C181.796719%2C150.609693%20173.782736%2C151.973534%20165.339049%2C152.986959%20C167.996555%2C148.775595%20170.619884%2C144.430263%20173.197646%2C139.960532%20C175.805484%2C135.438399%20178.28163%2C130.90943%20180.622896%2C126.396409%20L180.622896%2C126.396409%20Z%20M163.724586%2C134.496971%20C159.722835%2C141.435557%20155.614455%2C148.059271%20151.443648%2C154.311611%20C143.847063%2C154.854776%20135.998946%2C155.134562%20128.000001%2C155.134562%20C120.033408%2C155.134562%20112.284171%2C154.887129%20104.822013%2C154.402745%20C100.48306%2C148.068386%2096.285368%2C141.425078%2092.3091341%2C134.556664%20L92.3100455%2C134.556664%20C88.3442923%2C127.706935%2084.6943232%2C120.799333%2081.3870228%2C113.930466%20C84.6934118%2C107.045648%2088.3338117%2C100.130301%2092.276781%2C93.292874%20L92.2758697%2C93.294241%20C96.2293193%2C86.4385872%20100.390102%2C79.8276317%20104.688954%2C73.5329157%20C112.302398%2C72.9573964%20120.109505%2C72.6571055%20127.999545%2C72.6571055%20L128.000001%2C72.6571055%20C135.925583%2C72.6571055%20143.742714%2C72.9596746%20151.353879%2C73.5402067%20C155.587114%2C79.7888993%20159.719645%2C86.3784378%20163.688588%2C93.2350031%20C167.702644%2C100.168578%20171.389978%2C107.037901%20174.724618%2C113.77508%20C171.400003%2C120.627999%20167.720871%2C127.566587%20163.724586%2C134.496971%20L163.724586%2C134.496971%20Z%20M186.284677%2C12.3729198%20C194.857321%2C17.3165548%20198.191049%2C37.2542268%20192.804953%2C63.3986692%20C192.461372%2C65.0669011%20192.074504%2C66.7661189%20191.654369%2C68.4881206%20C181.03346%2C66.0374921%20169.500286%2C64.2138746%20157.425315%2C63.0810626%20C150.391035%2C53.0639249%20143.101577%2C43.9572289%20135.784778%2C36.073113%20C137.751934%2C34.1806885%20139.716356%2C32.3762092%20141.672575%2C30.673346%20C160.572216%2C14.2257007%20178.236518%2C7.73185406%20186.284677%2C12.3729198%20L186.284677%2C12.3729198%20Z%20M128.000001%2C90.8080696%20C140.624975%2C90.8080696%20150.859926%2C101.042565%20150.859926%2C113.667995%20C150.859926%2C126.292969%20140.624975%2C136.527922%20128.000001%2C136.527922%20C115.375026%2C136.527922%20105.140075%2C126.292969%20105.140075%2C113.667995%20C105.140075%2C101.042565%20115.375026%2C90.8080696%20128.000001%2C90.8080696%20L128.000001%2C90.8080696%20Z%22%20fill%3D%22%2300D8FF%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var FastAPI = "data:image/svg+xml,%3Csvg%20role%3D%22img%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EFastAPI%3C%2Ftitle%3E%3Cpath%20d%3D%22M12%200C5.375%200%200%205.375%200%2012c0%206.627%205.375%2012%2012%2012%206.626%200%2012-5.373%2012-12%200-6.625-5.373-12-12-12zm-.624%2021.62v-7.528H7.19L13.203%202.38v7.528h4.029L11.376%2021.62z%22%2F%3E%3C%2Fsvg%3E";

    var Flask = "a0682a9e38d2d424.svg";

    var TensorFlow = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22287px%22%20viewBox%3D%220%200%20256%20287%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cdefs%3E%20%20%20%20%20%20%20%20%3ClinearGradient%20x1%3D%220%25%22%20y1%3D%2250%25%22%20x2%3D%22100%25%22%20y2%3D%2250%25%22%20id%3D%22linearGradient-1%22%3E%20%20%20%20%20%20%20%20%20%20%20%20%3Cstop%20stop-color%3D%22%23FF6F00%22%20offset%3D%220%25%22%3E%3C%2Fstop%3E%20%20%20%20%20%20%20%20%20%20%20%20%3Cstop%20stop-color%3D%22%23FFA800%22%20offset%3D%22100%25%22%3E%3C%2Fstop%3E%20%20%20%20%20%20%20%20%3C%2FlinearGradient%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M133.446809%2C0%20L256%2C69.7191489%20L256%2C133.446809%20L182.468085%2C90.4170213%20L182.468085%2C122.553191%20L218.961702%2C143.795745%20L219.506383%2C198.808511%20L182.468085%2C177.565957%20L182.468085%2C258.178723%20L133.446809%2C286.502128%20L133.446809%2C0%20Z%20M122.553191%2C0%20L122.553191%2C286.502128%20L73.5319149%2C258.178723%20L73.5319149%2C90.4170213%20L0%2C133.446809%20L0%2C69.7191489%20L122.553191%2C0%20Z%22%20id%3D%22path-2%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fdefs%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cmask%20id%3D%22mask-3%22%20fill%3D%22white%22%3E%20%20%20%20%20%20%20%20%20%20%20%20%3Cuse%20xlink%3Ahref%3D%22%23path-2%22%3E%3C%2Fuse%3E%20%20%20%20%20%20%20%20%3C%2Fmask%3E%20%20%20%20%20%20%20%20%3Cuse%20fill%3D%22url%28%23linearGradient-1%29%22%20xlink%3Ahref%3D%22%23path-2%22%3E%3C%2Fuse%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var Pandas = "data:image/svg+xml,%3Csvg%20role%3D%22img%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3Epandas%3C%2Ftitle%3E%3Cpath%20d%3D%22M16.922%200h2.623v18.104h-2.623zm-4.126%2012.94h2.623v2.57h-2.623zm0-7.037h2.623v5.446h-2.623zm0%2011.197h2.623v5.446h-2.623zM4.456%205.896h2.622V24H4.455zm4.213%202.559h2.623v2.57H8.67zm0%204.151h2.623v5.447H8.67zm0-11.187h2.623v5.446H8.67Z%22%2F%3E%3C%2Fsvg%3E";

    var NumPy = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22274px%22%20viewBox%3D%220%200%20256%20274%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M191.54779%2C186.292389%20L191.607285%2C246.81213%20L137.903038%2C273.611369%20L137.903038%2C213.11807%20L191.54779%2C186.292389%20Z%20M256.000818%2C153.946885%20L256.000818%2C214.678164%20L210.196199%2C237.537504%20L210.163146%2C177.083869%20L256.000818%2C153.946885%20Z%20M191.468463%2C105.286501%20L191.527958%2C165.171627%20L137.903038%2C191.818823%20L137.903038%2C131.913865%20L191.468463%2C105.286501%20Z%20M256.000818%2C73.2054191%20L256.000818%2C132.713743%20L210.149925%2C156.022603%20L210.110262%2C96.0184858%20L256.000818%2C73.2054191%20Z%20M129.738988%2C66.1651652%20L177.67221%2C90.3598405%20L127.940914%2C115.334563%20L80.9133402%2C91.7150067%20L129.738988%2C66.1651652%20Z%20M63.0648093%2C32.5107686%20L108.783491%2C55.588258%20L59.8454631%2C81.1314889%20L12.8906057%2C57.5515964%20L63.0648093%2C32.5107686%20Z%20M193.755719%2C32.8611286%20L242.997833%2C57.5515964%20L198.958235%2C79.6705536%20L150.925855%2C55.4428255%20L193.755719%2C32.8611286%20Z%20M128.231779%2C3.55271368e-15%20L172.562241%2C22.2247263%20L130.056295%2C44.9188028%20L84.3772773%2C21.8809768%20L128.231779%2C3.55271368e-15%20Z%22%20fill%3D%22%234DABCF%22%3E%3C%2Fpath%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M118.943932%2C131.913865%20L82.7709095%2C113.728195%20L82.7709095%2C192.334447%20C82.7709095%2C192.334447%2038.5329951%2C98.2065835%2034.4344436%2C89.7516683%20C33.9055982%2C88.6609247%2031.7307216%2C87.4644121%2031.175434%2C87.1735472%20C23.2427536%2C83.0088899%200%2C71.2354701%200%2C71.2354701%20L0%2C210.110262%20L32.1537979%2C227.297736%20L32.1537979%2C154.7071%20C32.1537979%2C154.7071%2075.9223621%2C238.813344%2076.3652701%2C239.732213%20C76.8081781%2C240.651081%2081.2042052%2C249.515852%2085.8977077%2C252.629429%20C92.1513041%2C256.767644%20118.950543%2C272.884206%20118.950543%2C272.884206%20L118.943932%2C131.913865%20Z%22%20fill%3D%22%234D77CF%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var ScikitLearn = "data:image/svg+xml,%3Csvg%20role%3D%22img%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3Escikit-learn%3C%2Ftitle%3E%3Cpath%20d%3D%22M15.601%205.53c-1.91.035-3.981.91-5.63%202.56-2.93%202.93-2.083%208.53-1.088%209.525.805.804%206.595%201.843%209.526-1.088a9.74%209.74%200%200%200%20.584-.643c.043-.292.205-.66.489-1.106a1.848%201.848%200%200%201-.537.176c-.144.265-.37.55-.676.855-.354.335-.607.554-.76.656a.795.795%200%200%201-.437.152c-.35%200-.514-.308-.494-.924-.22.316-.425.549-.612.7a.914.914%200%200%201-.578.224c-.194%200-.36-.09-.496-.273a1.03%201.03%200%200%201-.193-.507%204.016%204.016%200%200%201-.726.583c-.224.132-.47.197-.74.197-.3%200-.543-.096-.727-.288a.978.978%200%200%201-.257-.524v.004c-.3.276-.564.48-.79.611a1.295%201.295%200%200%201-.649.197.693.693%200%200%201-.571-.275c-.145-.183-.218-.43-.218-.739%200-.464.101-1.02.302-1.67.201-.65.445-1.25.733-1.797l.842-.312a.21.21%200%200%201%20.06-.013c.063%200%20.116.047.157.14.04.095.061.221.061.38%200%20.451-.104.888-.312%201.31-.207.422-.532.873-.974%201.352-.018.23-.027.388-.027.474%200%20.193.036.345.106.458.071.113.165.169.282.169a.71.71%200%200%200%20.382-.13c.132-.084.333-.26.602-.523.028-.418.187-.798.482-1.142.324-.38.685-.569%201.08-.569.206%200%20.37.054.494.16a.524.524%200%200%201%20.186.417c0%20.458-.486.829-1.459%201.114.088.43.32.646.693.646a.807.807%200%200%200%20.417-.117c.129-.076.321-.243.575-.497.032-.252.118-.495.259-.728.182-.3.416-.544.701-.73.285-.185.537-.278.756-.278.276%200%20.47.127.58.381l.677-.374h.186l-.292.971c-.15.488-.226.823-.226%201.004%200%20.19.067.285.202.285.086%200%20.181-.045.285-.137.104-.092.25-.232.437-.42v.001c.143-.155.274-.32.392-.494-.19-.084-.285-.21-.285-.375%200-.17.058-.352.174-.545.116-.194.275-.29.479-.29.172%200%20.258.088.258.265%200%20.139-.05.338-.149.596.367-.04.687-.32.961-.842l.228-.01c1.059-2.438.828-5.075-.83-6.732-1.019-1.02-2.408-1.5-3.895-1.471zm4.725%208.203a8.938%208.938%200%200%201-1.333%202.151%201.09%201.09%200%200%200-.012.147c0%20.168.047.309.14.423.092.113.206.17.34.17.296%200%20.714-.264%201.254-.787-.001.04-.003.08-.003.121%200%20.146.012.368.036.666l.733-.172c0-.2.003-.357.01-.474.01-.157.033-.33.066-.517.02-.11.07-.216.152-.315l.186-.216a5.276%205.276%200%200%201%20.378-.397c.062-.055.116-.099.162-.13a.26.26%200%200%201%20.123-.046c.055%200%20.083.035.083.106%200%20.07-.052.236-.156.497-.194.486-.292.848-.292%201.084%200%20.175.046.314.136.418a.45.45%200%200%200%20.358.155c.365%200%20.803-.269%201.313-.808v-.381c-.361.426-.623.64-.784.64-.109%200-.163-.067-.163-.2%200-.1.065-.316.195-.65.19-.486.285-.836.285-1.048a.464.464%200%200%200-.112-.319.36.36%200%200%200-.282-.127c-.165%200-.354.077-.567.233-.213.156-.5.436-.863.84.053-.262.165-.622.335-1.08l-.809.156a6.54%206.54%200%200%200-.399%201.074c-.04.156-.07.316-.092.48a7.447%207.447%200%200%201-.49.45.38.38%200%200%201-.229.08.208.208%200%200%201-.174-.082.352.352%200%200%201-.064-.222c0-.1.019-.214.056-.343.038-.13.12-.373.249-.731l.308-.849zm-17.21-2.927c-.863-.016-1.67.263-2.261.854-1.352%201.352-1.07%203.827.631%205.527%201.7%201.701%204.95%201.21%205.527.632.467-.466%201.07-3.827-.631-5.527-.957-.957-2.158-1.465-3.267-1.486zm12.285.358h.166v.21H15.4zm.427%200h.166v.865l.46-.455h.195l-.364.362.428.684h-.198l-.357-.575-.164.166v.41h-.166zm1.016%200h.166v.21h-.166zm.481.122h.166v.288h.172v.135h-.172v.717c0%20.037.006.062.02.075.012.013.037.02.074.02a.23.23%200%200%200%20.078-.01v.141a.802.802%200%200%201-.136.014.23.23%200%200%201-.15-.043.15.15%200%200%201-.052-.123v-.79h-.141v-.136h.141zm-3.562.258c.081%200%20.15.012.207.038.057.024.1.061.13.11s.045.106.045.173h-.176c-.006-.111-.075-.167-.208-.167a.285.285%200%200%200-.164.041.134.134%200%200%200-.06.117c0%20.035.015.065.045.088.03.024.08.044.15.06l.16.039a.47.47%200%200%201%20.224.105c.047.046.07.108.07.186a.3.3%200%200%201-.052.175.327.327%200%200%201-.152.116.585.585%200%200%201-.226.041c-.136%200-.24-.03-.309-.088-.069-.059-.105-.149-.109-.269h.176c.004.037.01.065.017.084a.166.166%200%200%200%20.034.054c.044.043.112.065.204.065a.31.31%200%200%200%20.177-.045.139.139%200%200%200%20.067-.119.116.116%200%200%200-.038-.09.287.287%200%200%200-.124-.055l-.156-.038a1.248%201.248%200%200%201-.159-.05.359.359%200%200%201-.098-.061.22.22%200%200%201-.058-.083.32.32%200%200%201-.016-.108c0-.096.036-.174.109-.232a.45.45%200%200%201%20.29-.087zm1.035%200a.46.46%200%200%201%20.202.043.351.351%200%200%201%20.187.212.577.577%200%200%201%20.023.126h-.168a.256.256%200%200%200-.078-.168.242.242%200%200%200-.17-.06.248.248%200%200%200-.155.05.306.306%200%200%200-.1.144.662.662%200%200%200-.034.224.58.58%200%200%200%20.035.214.299.299%200%200%200%20.101.135.261.261%200%200%200%20.157.048c.142%200%20.227-.084.256-.252h.167a.519.519%200%200%201-.065.22.35.35%200%200%201-.146.138.464.464%200%200%201-.216.048.448.448%200%200%201-.246-.066.441.441%200%200%201-.161-.192.703.703%200%200%201-.057-.293c0-.085.01-.163.032-.233a.522.522%200%200%201%20.095-.182.403.403%200%200%201%20.15-.117.453.453%200%200%201%20.191-.04zm.603.03h.166v1.046H15.4zm1.443%200h.166v1.046h-.166zm-5.05.618c-.08%200-.2.204-.356.611-.155.407-.308.977-.459%201.71.281-.312.509-.662.683-1.05.175-.387.262-.72.262-.999a.455.455%200%200%200-.036-.197c-.025-.05-.056-.075-.093-.075zm4.662%201.797c-.221%200-.431.188-.629.563-.197.376-.296.722-.296%201.038%200%20.12.029.216.088.29a.273.273%200%200%200%20.223.111c.221%200%20.43-.188.625-.565.196-.377.294-.725.294-1.043a.457.457%200%200%200-.083-.29.269.269%200%200%200-.222-.104zm-2.848.007c-.146%200-.285.11-.417.333-.133.222-.2.51-.2.866.566-.159.849-.452.849-.881%200-.212-.077-.318-.232-.318Z%22%2F%3E%3C%2Fsvg%3E";

    /* src/Skillset.svelte generated by Svelte v3.50.1 */
    const file$6 = "src/Skillset.svelte";

    function create_fragment$7(ctx) {
    	let section1;
    	let h2;
    	let t0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let section0;
    	let h30;
    	let t3;
    	let ul0;
    	let li0;
    	let img1;
    	let img1_src_value;
    	let span0;
    	let t5;
    	let li1;
    	let img2;
    	let img2_src_value;
    	let span1;
    	let t7;
    	let li2;
    	let img3;
    	let img3_src_value;
    	let span2;
    	let t9;
    	let h31;
    	let t11;
    	let ul1;
    	let li3;
    	let img4;
    	let img4_src_value;
    	let span3;
    	let t13;
    	let li4;
    	let img5;
    	let img5_src_value;
    	let span4;
    	let t15;
    	let h32;
    	let t17;
    	let ul2;
    	let li5;
    	let img6;
    	let img6_src_value;
    	let span5;
    	let t19;
    	let li6;
    	let img7;
    	let img7_src_value;
    	let span6;
    	let t21;
    	let h33;
    	let t23;
    	let ul3;
    	let li7;
    	let img8;
    	let img8_src_value;
    	let span7;
    	let t25;
    	let li8;
    	let img9;
    	let img9_src_value;
    	let span8;
    	let t27;
    	let li9;
    	let img10;
    	let img10_src_value;
    	let t28;
    	let t29;
    	let li10;
    	let img11;
    	let img11_src_value;
    	let span9;

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			h2 = element("h2");
    			t0 = text("Skillset ");
    			img0 = element("img");
    			t1 = space();
    			section0 = element("section");
    			h30 = element("h3");
    			h30.textContent = "Programming Languages:";
    			t3 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			img1 = element("img");
    			span0 = element("span");
    			span0.textContent = "C++";
    			t5 = space();
    			li1 = element("li");
    			img2 = element("img");
    			span1 = element("span");
    			span1.textContent = "Python";
    			t7 = space();
    			li2 = element("li");
    			img3 = element("img");
    			span2 = element("span");
    			span2.textContent = "JavaScript";
    			t9 = space();
    			h31 = element("h3");
    			h31.textContent = "Frontend Tools:";
    			t11 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			img4 = element("img");
    			span3 = element("span");
    			span3.textContent = "ReactJs";
    			t13 = space();
    			li4 = element("li");
    			img5 = element("img");
    			span4 = element("span");
    			span4.textContent = "SvelteJs";
    			t15 = space();
    			h32 = element("h3");
    			h32.textContent = "Backend Tools:";
    			t17 = space();
    			ul2 = element("ul");
    			li5 = element("li");
    			img6 = element("img");
    			span5 = element("span");
    			span5.textContent = "FastAPI";
    			t19 = space();
    			li6 = element("li");
    			img7 = element("img");
    			span6 = element("span");
    			span6.textContent = "Flask";
    			t21 = space();
    			h33 = element("h3");
    			h33.textContent = "ML Tools:";
    			t23 = space();
    			ul3 = element("ul");
    			li7 = element("li");
    			img8 = element("img");
    			span7 = element("span");
    			span7.textContent = "NumPy";
    			t25 = space();
    			li8 = element("li");
    			img9 = element("img");
    			span8 = element("span");
    			span8.textContent = "Pandas";
    			t27 = space();
    			li9 = element("li");
    			img10 = element("img");
    			t28 = text("ScikitLearn");
    			t29 = space();
    			li10 = element("li");
    			img11 = element("img");
    			span9 = element("span");
    			span9.textContent = "TensorFlow";
    			if (!src_url_equal(img0.src, img0_src_value = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Cat Face");
    			attr_dev(img0, "width", "50");
    			attr_dev(img0, "height", "50");
    			add_location(img0, file$6, 15, 17, 597);
    			attr_dev(h2, "class", "svelte-187fsyc");
    			add_location(h2, file$6, 15, 4, 584);
    			attr_dev(h30, "class", "svelte-187fsyc");
    			add_location(h30, file$6, 17, 8, 802);
    			if (!src_url_equal(img1.src, img1_src_value = Cplusplus)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "C++ icon");
    			attr_dev(img1, "class", "svelte-187fsyc");
    			add_location(img1, file$6, 19, 16, 863);
    			attr_dev(span0, "class", "svelte-187fsyc");
    			add_location(span0, file$6, 19, 54, 901);
    			attr_dev(li0, "class", "svelte-187fsyc");
    			add_location(li0, file$6, 19, 12, 859);
    			if (!src_url_equal(img2.src, img2_src_value = Python)) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Python icon");
    			attr_dev(img2, "class", "svelte-187fsyc");
    			add_location(img2, file$6, 20, 16, 939);
    			attr_dev(span1, "class", "svelte-187fsyc");
    			add_location(span1, file$6, 20, 54, 977);
    			attr_dev(li1, "class", "svelte-187fsyc");
    			add_location(li1, file$6, 20, 12, 935);
    			if (!src_url_equal(img3.src, img3_src_value = JavaScript)) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "JavaScript Icon");
    			attr_dev(img3, "class", "svelte-187fsyc");
    			add_location(img3, file$6, 21, 16, 1018);
    			attr_dev(span2, "class", "svelte-187fsyc");
    			add_location(span2, file$6, 21, 62, 1064);
    			attr_dev(li2, "class", "svelte-187fsyc");
    			add_location(li2, file$6, 21, 12, 1014);
    			attr_dev(ul0, "class", "svelte-187fsyc");
    			add_location(ul0, file$6, 18, 8, 842);
    			attr_dev(h31, "class", "svelte-187fsyc");
    			add_location(h31, file$6, 23, 8, 1115);
    			if (!src_url_equal(img4.src, img4_src_value = React)) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Reactjs icon");
    			attr_dev(img4, "title", "ReactJs");
    			attr_dev(img4, "class", "svelte-187fsyc");
    			add_location(img4, file$6, 25, 16, 1169);
    			attr_dev(span3, "class", "svelte-187fsyc");
    			add_location(span3, file$6, 25, 70, 1223);
    			attr_dev(li3, "class", "svelte-187fsyc");
    			add_location(li3, file$6, 25, 12, 1165);
    			if (!src_url_equal(img5.src, img5_src_value = Svelte)) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Sveltejs icon");
    			attr_dev(img5, "title", "Sveltejs");
    			attr_dev(img5, "class", "svelte-187fsyc");
    			add_location(img5, file$6, 26, 16, 1265);
    			attr_dev(span4, "class", "svelte-187fsyc");
    			add_location(span4, file$6, 26, 73, 1322);
    			attr_dev(li4, "class", "svelte-187fsyc");
    			add_location(li4, file$6, 26, 12, 1261);
    			attr_dev(ul1, "class", "svelte-187fsyc");
    			add_location(ul1, file$6, 24, 8, 1148);
    			attr_dev(h32, "class", "svelte-187fsyc");
    			add_location(h32, file$6, 28, 8, 1371);
    			if (!src_url_equal(img6.src, img6_src_value = FastAPI)) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "FastAPI icon");
    			attr_dev(img6, "class", "svelte-187fsyc");
    			add_location(img6, file$6, 30, 16, 1424);
    			attr_dev(span5, "class", "svelte-187fsyc");
    			add_location(span5, file$6, 30, 56, 1464);
    			attr_dev(li5, "class", "svelte-187fsyc");
    			add_location(li5, file$6, 30, 12, 1420);
    			if (!src_url_equal(img7.src, img7_src_value = Flask)) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Flask icon");
    			attr_dev(img7, "class", "svelte-187fsyc");
    			add_location(img7, file$6, 31, 16, 1506);
    			attr_dev(span6, "class", "svelte-187fsyc");
    			add_location(span6, file$6, 31, 52, 1542);
    			attr_dev(li6, "class", "svelte-187fsyc");
    			add_location(li6, file$6, 31, 12, 1502);
    			attr_dev(ul2, "class", "svelte-187fsyc");
    			add_location(ul2, file$6, 29, 8, 1403);
    			attr_dev(h33, "class", "svelte-187fsyc");
    			add_location(h33, file$6, 33, 8, 1588);
    			if (!src_url_equal(img8.src, img8_src_value = NumPy)) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "NumPy icon");
    			attr_dev(img8, "class", "svelte-187fsyc");
    			add_location(img8, file$6, 35, 16, 1636);
    			attr_dev(span7, "class", "svelte-187fsyc");
    			add_location(span7, file$6, 35, 52, 1672);
    			attr_dev(li7, "class", "svelte-187fsyc");
    			add_location(li7, file$6, 35, 12, 1632);
    			if (!src_url_equal(img9.src, img9_src_value = Pandas)) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "Pandas icon");
    			attr_dev(img9, "class", "svelte-187fsyc");
    			add_location(img9, file$6, 36, 16, 1712);
    			attr_dev(span8, "class", "svelte-187fsyc");
    			add_location(span8, file$6, 36, 54, 1750);
    			attr_dev(li8, "class", "svelte-187fsyc");
    			add_location(li8, file$6, 36, 12, 1708);
    			if (!src_url_equal(img10.src, img10_src_value = ScikitLearn)) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "ScikitLearn icon");
    			attr_dev(img10, "class", "svelte-187fsyc");
    			add_location(img10, file$6, 37, 16, 1791);
    			attr_dev(li9, "class", "svelte-187fsyc");
    			add_location(li9, file$6, 37, 12, 1787);
    			if (!src_url_equal(img11.src, img11_src_value = TensorFlow)) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "TensorFlow icon");
    			attr_dev(img11, "class", "svelte-187fsyc");
    			add_location(img11, file$6, 38, 16, 1872);
    			attr_dev(span9, "class", "svelte-187fsyc");
    			add_location(span9, file$6, 38, 62, 1918);
    			attr_dev(li10, "class", "svelte-187fsyc");
    			add_location(li10, file$6, 38, 12, 1868);
    			attr_dev(ul3, "class", "svelte-187fsyc");
    			add_location(ul3, file$6, 34, 8, 1615);
    			attr_dev(section0, "class", "tools svelte-187fsyc");
    			add_location(section0, file$6, 16, 4, 770);
    			attr_dev(section1, "class", "skillset svelte-187fsyc");
    			add_location(section1, file$6, 14, 0, 553);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, img0);
    			append_dev(section1, t1);
    			append_dev(section1, section0);
    			append_dev(section0, h30);
    			append_dev(section0, t3);
    			append_dev(section0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, img1);
    			append_dev(li0, span0);
    			append_dev(ul0, t5);
    			append_dev(ul0, li1);
    			append_dev(li1, img2);
    			append_dev(li1, span1);
    			append_dev(ul0, t7);
    			append_dev(ul0, li2);
    			append_dev(li2, img3);
    			append_dev(li2, span2);
    			append_dev(section0, t9);
    			append_dev(section0, h31);
    			append_dev(section0, t11);
    			append_dev(section0, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, img4);
    			append_dev(li3, span3);
    			append_dev(ul1, t13);
    			append_dev(ul1, li4);
    			append_dev(li4, img5);
    			append_dev(li4, span4);
    			append_dev(section0, t15);
    			append_dev(section0, h32);
    			append_dev(section0, t17);
    			append_dev(section0, ul2);
    			append_dev(ul2, li5);
    			append_dev(li5, img6);
    			append_dev(li5, span5);
    			append_dev(ul2, t19);
    			append_dev(ul2, li6);
    			append_dev(li6, img7);
    			append_dev(li6, span6);
    			append_dev(section0, t21);
    			append_dev(section0, h33);
    			append_dev(section0, t23);
    			append_dev(section0, ul3);
    			append_dev(ul3, li7);
    			append_dev(li7, img8);
    			append_dev(li7, span7);
    			append_dev(ul3, t25);
    			append_dev(ul3, li8);
    			append_dev(li8, img9);
    			append_dev(li8, span8);
    			append_dev(ul3, t27);
    			append_dev(ul3, li9);
    			append_dev(li9, img10);
    			append_dev(li9, t28);
    			append_dev(ul3, t29);
    			append_dev(ul3, li10);
    			append_dev(li10, img11);
    			append_dev(li10, span9);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skillset', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skillset> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		JavaScript,
    		Python,
    		Cplusplus,
    		Svelte,
    		React,
    		FastAPI,
    		Flask,
    		TensorFlow,
    		Pandas,
    		NumPy,
    		ScikitLearn
    	});

    	return [];
    }

    class Skillset extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$7, create_fragment$7, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skillset",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/Project.svelte generated by Svelte v3.50.1 */

    const file$5 = "src/components/Project.svelte";

    function create_fragment$6(ctx) {
    	let section;
    	let a;
    	let figure;
    	let img;
    	let img_src_value;
    	let t0;
    	let h5;
    	let t1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			a = element("a");
    			figure = element("figure");
    			img = element("img");
    			t0 = space();
    			h5 = element("h5");
    			t1 = text(/*name*/ ctx[0]);
    			if (!src_url_equal(img.src, img_src_value = /*thumbnail*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*altThumbnail*/ ctx[3]);
    			attr_dev(img, "class", "svelte-1yv6d7b");
    			add_location(img, file$5, 7, 12, 184);
    			attr_dev(figure, "class", "svelte-1yv6d7b");
    			add_location(figure, file$5, 6, 8, 163);
    			attr_dev(h5, "class", "svelte-1yv6d7b");
    			add_location(h5, file$5, 9, 8, 251);
    			attr_dev(a, "href", /*url*/ ctx[1]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			attr_dev(a, "class", "svelte-1yv6d7b");
    			add_location(a, file$5, 5, 4, 98);
    			attr_dev(section, "class", "card svelte-1yv6d7b");
    			add_location(section, file$5, 4, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, a);
    			append_dev(a, figure);
    			append_dev(figure, img);
    			append_dev(a, t0);
    			append_dev(a, h5);
    			append_dev(h5, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*thumbnail*/ 4 && !src_url_equal(img.src, img_src_value = /*thumbnail*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*altThumbnail*/ 8) {
    				attr_dev(img, "alt", /*altThumbnail*/ ctx[3]);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);

    			if (dirty & /*url*/ 2) {
    				attr_dev(a, "href", /*url*/ ctx[1]);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Project', slots, []);
    	let { name, url, thumbnail, altThumbnail } = $$props;
    	const writable_props = ['name', 'url', 'thumbnail', 'altThumbnail'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('url' in $$props) $$invalidate(1, url = $$props.url);
    		if ('thumbnail' in $$props) $$invalidate(2, thumbnail = $$props.thumbnail);
    		if ('altThumbnail' in $$props) $$invalidate(3, altThumbnail = $$props.altThumbnail);
    	};

    	$$self.$capture_state = () => ({ name, url, thumbnail, altThumbnail });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('url' in $$props) $$invalidate(1, url = $$props.url);
    		if ('thumbnail' in $$props) $$invalidate(2, thumbnail = $$props.thumbnail);
    		if ('altThumbnail' in $$props) $$invalidate(3, altThumbnail = $$props.altThumbnail);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, url, thumbnail, altThumbnail];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$6, create_fragment$6, safe_not_equal$1, {
    			name: 0,
    			url: 1,
    			thumbnail: 2,
    			altThumbnail: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Project> was created without expected prop 'name'");
    		}

    		if (/*url*/ ctx[1] === undefined && !('url' in props)) {
    			console.warn("<Project> was created without expected prop 'url'");
    		}

    		if (/*thumbnail*/ ctx[2] === undefined && !('thumbnail' in props)) {
    			console.warn("<Project> was created without expected prop 'thumbnail'");
    		}

    		if (/*altThumbnail*/ ctx[3] === undefined && !('altThumbnail' in props)) {
    			console.warn("<Project> was created without expected prop 'altThumbnail'");
    		}
    	}

    	get name() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnail() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnail(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get altThumbnail() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set altThumbnail(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Coding = "f7bc5d696ecfccd7.svg";

    var Aguacatitos = "f5d2245e013833ba.png";

    var Foxes = "b1ed922763bbf01e.png";

    var Weather = "b8b7e127554e9da5.png";

    var DrMock = "dea966fd7555985f.png";

    var FunctionalProgramming = "0d2ec71c43ff1ada.png";

    var WordCloud = "6e691189dd9590d4.png";

    /* src/Projects.svelte generated by Svelte v3.50.1 */
    const file$4 = "src/Projects.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (59:16) {#each projects as project}
    function create_each_block(ctx) {
    	let project;
    	let current;

    	project = new Project({
    			props: {
    				name: /*project*/ ctx[1].name,
    				url: /*project*/ ctx[1].url,
    				thumbnail: /*project*/ ctx[1].thumbnail,
    				altThumbnail: /*project*/ ctx[1].altThumbnail
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(project.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(project, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(project.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(project.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(project, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(59:16) {#each projects as project}",
    		ctx
    	});

    	return block;
    }

    // (56:4) <Reveal reveal='fadeInRight' duration='1'>
    function create_default_slot(ctx) {
    	let section1;
    	let section0;
    	let t;
    	let figure;
    	let img;
    	let img_src_value;
    	let current;
    	let each_value = /*projects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			section0 = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			figure = element("figure");
    			img = element("img");
    			attr_dev(section0, "class", "cards svelte-m4jm4q");
    			add_location(section0, file$4, 57, 12, 2051);
    			if (!src_url_equal(img.src, img_src_value = Coding)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Boy showing code");
    			attr_dev(img, "class", "svelte-m4jm4q");
    			add_location(img, file$4, 67, 16, 2457);
    			attr_dev(figure, "class", "code-pic svelte-m4jm4q");
    			add_location(figure, file$4, 66, 12, 2415);
    			attr_dev(section1, "class", "container-projects svelte-m4jm4q");
    			add_location(section1, file$4, 56, 8, 2002);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, section0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section0, null);
    			}

    			append_dev(section1, t);
    			append_dev(section1, figure);
    			append_dev(figure, img);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*projects*/ 1) {
    				each_value = /*projects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(56:4) <Reveal reveal='fadeInRight' duration='1'>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let subtitle;
    	let t;
    	let reveal;
    	let current;

    	subtitle = new Subtitle({
    			props: { content: "Projects" },
    			$$inline: true
    		});

    	reveal = new Reveal({
    			props: {
    				reveal: "fadeInRight",
    				duration: "1",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(subtitle.$$.fragment);
    			t = space();
    			create_component(reveal.$$.fragment);
    			attr_dev(section, "id", "projects");
    			attr_dev(section, "class", "svelte-m4jm4q");
    			add_location(section, file$4, 53, 0, 1877);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(subtitle, section, null);
    			append_dev(section, t);
    			mount_component(reveal, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const reveal_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				reveal_changes.$$scope = { dirty, ctx };
    			}

    			reveal.$set(reveal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subtitle.$$.fragment, local);
    			transition_in(reveal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subtitle.$$.fragment, local);
    			transition_out(reveal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(subtitle);
    			destroy_component(reveal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);

    	const projects = [
    		{
    			name: 'Avocados',
    			url: 'https://daniel692a.github.io/workshop1-DOM/',
    			thumbnail: Aguacatitos,
    			altThumbnail: 'Aguacatitos thumbnail project'
    		},
    		{
    			name: 'Random Foxes images',
    			url: 'https://daniel692a.github.io/lazy-loading/',
    			thumbnail: Foxes,
    			altThumbnail: 'Foxes thumbnail project'
    		},
    		{
    			name: 'Weather App',
    			url: 'https://daniel692a.github.io/weather-app/',
    			thumbnail: Weather,
    			altThumbnail: 'Weather thumbnail project'
    		},
    		{
    			name: 'Dr. Mock Interview',
    			url: 'https://daniel692a.github.io/RoboHacksdemo/',
    			thumbnail: DrMock,
    			altThumbnail: 'Dr. Mock thumbnail project'
    		},
    		{
    			name: 'Programación Funcional',
    			url: 'https://mlsa-latam.github.io/programacion-funcional/',
    			thumbnail: FunctionalProgramming,
    			altThumbnail: 'Programación Funcional thumbnail project'
    		},
    		{
    			name: 'Summarize Cloud',
    			url: 'https://share.streamlit.io/daniel692a/shentiment/main/main.py',
    			thumbnail: WordCloud,
    			altThumbnail: 'Summarize Cloud thumbnail project'
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Subtitle,
    		Project,
    		Reveal,
    		Coding,
    		Aguacatitos,
    		Foxes,
    		Weather,
    		DrMock,
    		FunctionalProgramming,
    		WordCloud,
    		projects
    	});

    	return [projects];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$5, create_fragment$5, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    var GitHub = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22250px%22%20viewBox%3D%220%200%20256%20250%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M128.00106%2C0%20C57.3172926%2C0%200%2C57.3066942%200%2C128.00106%20C0%2C184.555281%2036.6761997%2C232.535542%2087.534937%2C249.460899%20C93.9320223%2C250.645779%2096.280588%2C246.684165%2096.280588%2C243.303333%20C96.280588%2C240.251045%2096.1618878%2C230.167899%2096.106777%2C219.472176%20C60.4967585%2C227.215235%2052.9826207%2C204.369712%2052.9826207%2C204.369712%20C47.1599584%2C189.574598%2038.770408%2C185.640538%2038.770408%2C185.640538%20C27.1568785%2C177.696113%2039.6458206%2C177.859325%2039.6458206%2C177.859325%20C52.4993419%2C178.762293%2059.267365%2C191.04987%2059.267365%2C191.04987%20C70.6837675%2C210.618423%2089.2115753%2C204.961093%2096.5158685%2C201.690482%20C97.6647155%2C193.417512%20100.981959%2C187.77078%20104.642583%2C184.574357%20C76.211799%2C181.33766%2046.324819%2C170.362144%2046.324819%2C121.315702%20C46.324819%2C107.340889%2051.3250588%2C95.9223682%2059.5132437%2C86.9583937%20C58.1842268%2C83.7344152%2053.8029229%2C70.715562%2060.7532354%2C53.0843636%20C60.7532354%2C53.0843636%2071.5019501%2C49.6441813%2095.9626412%2C66.2049595%20C106.172967%2C63.368876%20117.123047%2C61.9465949%20128.00106%2C61.8978432%20C138.879073%2C61.9465949%20149.837632%2C63.368876%20160.067033%2C66.2049595%20C184.49805%2C49.6441813%20195.231926%2C53.0843636%20195.231926%2C53.0843636%20C202.199197%2C70.715562%20197.815773%2C83.7344152%20196.486756%2C86.9583937%20C204.694018%2C95.9223682%20209.660343%2C107.340889%20209.660343%2C121.315702%20C209.660343%2C170.478725%20179.716133%2C181.303747%20151.213281%2C184.472614%20C155.80443%2C188.444828%20159.895342%2C196.234518%20159.895342%2C208.176593%20C159.895342%2C225.303317%20159.746968%2C239.087361%20159.746968%2C243.303333%20C159.746968%2C246.709601%20162.05102%2C250.70089%20168.53925%2C249.443941%20C219.370432%2C232.499507%20256%2C184.536204%20256%2C128.00106%20C256%2C57.3066942%20198.691187%2C0%20128.00106%2C0%20Z%20M47.9405593%2C182.340212%20C47.6586465%2C182.976105%2046.6581745%2C183.166873%2045.7467277%2C182.730227%20C44.8183235%2C182.312656%2044.2968914%2C181.445722%2044.5978808%2C180.80771%20C44.8734344%2C180.152739%2045.876026%2C179.97045%2046.8023103%2C180.409216%20C47.7328342%2C180.826786%2048.2627451%2C181.702199%2047.9405593%2C182.340212%20Z%20M54.2367892%2C187.958254%20C53.6263318%2C188.524199%2052.4329723%2C188.261363%2051.6232682%2C187.366874%20C50.7860088%2C186.474504%2050.6291553%2C185.281144%2051.2480912%2C184.70672%20C51.8776254%2C184.140775%2053.0349512%2C184.405731%2053.8743302%2C185.298101%20C54.7115892%2C186.201069%2054.8748019%2C187.38595%2054.2367892%2C187.958254%20Z%20M58.5562413%2C195.146347%20C57.7719732%2C195.691096%2056.4895886%2C195.180261%2055.6968417%2C194.042013%20C54.9125733%2C192.903764%2054.9125733%2C191.538713%2055.713799%2C190.991845%20C56.5086651%2C190.444977%2057.7719732%2C190.936735%2058.5753181%2C192.066505%20C59.3574669%2C193.22383%2059.3574669%2C194.58888%2058.5562413%2C195.146347%20Z%20M65.8613592%2C203.471174%20C65.1597571%2C204.244846%2063.6654083%2C204.03712%2062.5716717%2C202.981538%20C61.4524999%2C201.94927%2061.1409122%2C200.484596%2061.8446341%2C199.710926%20C62.5547146%2C198.935137%2064.0575422%2C199.15346%2065.1597571%2C200.200564%20C66.2704506%2C201.230712%2066.6095936%2C202.705984%2065.8613592%2C203.471174%20Z%20M75.3025151%2C206.281542%20C74.9930474%2C207.284134%2073.553809%2C207.739857%2072.1039724%2C207.313809%20C70.6562556%2C206.875043%2069.7087748%2C205.700761%2070.0012857%2C204.687571%20C70.302275%2C203.678621%2071.7478721%2C203.20382%2073.2083069%2C203.659543%20C74.6539041%2C204.09619%2075.6035048%2C205.261994%2075.3025151%2C206.281542%20Z%20M86.046947%2C207.473627%20C86.0829806%2C208.529209%2084.8535871%2C209.404622%2083.3316829%2C209.4237%20C81.8013%2C209.457614%2080.563428%2C208.603398%2080.5464708%2C207.564772%20C80.5464708%2C206.498591%2081.7483088%2C205.631657%2083.2786917%2C205.606221%20C84.8005962%2C205.576546%2086.046947%2C206.424403%2086.046947%2C207.473627%20Z%20M96.6021471%2C207.069023%20C96.7844366%2C208.099171%2095.7267341%2C209.156872%2094.215428%2C209.438785%20C92.7295577%2C209.710099%2091.3539086%2C209.074206%2091.1652603%2C208.052538%20C90.9808515%2C206.996955%2092.0576306%2C205.939253%2093.5413813%2C205.66582%20C95.054807%2C205.402984%2096.4092596%2C206.021919%2096.6021471%2C207.069023%20Z%22%20fill%3D%22%23efefef%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var LinkedIn = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22256px%22%20viewBox%3D%220%200%20256%20256%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M218.123122%2C218.127392%20L180.191928%2C218.127392%20L180.191928%2C158.724263%20C180.191928%2C144.559023%20179.939053%2C126.323993%20160.463756%2C126.323993%20C140.707926%2C126.323993%20137.685284%2C141.757585%20137.685284%2C157.692986%20L137.685284%2C218.123441%20L99.7540894%2C218.123441%20L99.7540894%2C95.9665207%20L136.168036%2C95.9665207%20L136.168036%2C112.660562%20L136.677736%2C112.660562%20C144.102746%2C99.9650027%20157.908637%2C92.3824528%20172.605689%2C92.9280076%20C211.050535%2C92.9280076%20218.138927%2C118.216023%20218.138927%2C151.114151%20L218.123122%2C218.127392%20Z%20M56.9550587%2C79.2685282%20C44.7981969%2C79.2707099%2034.9413443%2C69.4171797%2034.9391618%2C57.260052%20C34.93698%2C45.1029244%2044.7902948%2C35.2458562%2056.9471566%2C35.2436736%20C69.1040185%2C35.2414916%2078.9608713%2C45.0950217%2078.963054%2C57.2521493%20C78.9641017%2C63.090208%2076.6459976%2C68.6895714%2072.5186979%2C72.8184433%20C68.3913982%2C76.9473153%2062.7929898%2C79.26748%2056.9550587%2C79.2685282%20M75.9206558%2C218.127392%20L37.94995%2C218.127392%20L37.94995%2C95.9665207%20L75.9206558%2C95.9665207%20L75.9206558%2C218.127392%20Z%20M237.033403%2C0.0182577091%20L18.8895249%2C0.0182577091%20C8.57959469%2C-0.0980923971%200.124827038%2C8.16056231%20-0.001%2C18.4706066%20L-0.001%2C237.524091%20C0.120519052%2C247.839103%208.57460631%2C256.105934%2018.8895249%2C255.9977%20L237.033403%2C255.9977%20C247.368728%2C256.125818%20255.855922%2C247.859464%20255.999%2C237.524091%20L255.999%2C18.4548016%20C255.851624%2C8.12438979%20247.363742%2C-0.133792868%20237.033403%2C0.000790807055%22%20fill%3D%22%23efefef%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var Twitter = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%20standalone%3D%22no%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22209px%22%20viewBox%3D%220%200%20256%20209%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M256%2C25.4500259%20C246.580841%2C29.6272672%20236.458451%2C32.4504868%20225.834156%2C33.7202333%20C236.678503%2C27.2198053%20245.00583%2C16.9269929%20248.927437%2C4.66307685%20C238.779765%2C10.6812633%20227.539325%2C15.0523376%20215.57599%2C17.408298%20C205.994835%2C7.2006971%20192.34506%2C0.822%20177.239197%2C0.822%20C148.232605%2C0.822%20124.716076%2C24.3375931%20124.716076%2C53.3423116%20C124.716076%2C57.4586875%20125.181462%2C61.4673784%20126.076652%2C65.3112644%20C82.4258385%2C63.1210453%2043.7257252%2C42.211429%2017.821398%2C10.4359288%20C13.3005011%2C18.1929938%2010.710443%2C27.2151234%2010.710443%2C36.8402889%20C10.710443%2C55.061526%2019.9835254%2C71.1374907%2034.0762135%2C80.5557137%20C25.4660961%2C80.2832239%2017.3681846%2C77.9207088%2010.2862577%2C73.9869292%20C10.2825122%2C74.2060448%2010.2825122%2C74.4260967%2010.2825122%2C74.647085%20C10.2825122%2C100.094453%2028.3867003%2C121.322443%2052.413563%2C126.14673%20C48.0059695%2C127.347184%2043.3661509%2C127.988612%2038.5755734%2C127.988612%20C35.1914554%2C127.988612%2031.9009766%2C127.659938%2028.694773%2C127.046602%20C35.3777973%2C147.913145%2054.7742053%2C163.097665%2077.7569918%2C163.52185%20C59.7820257%2C177.607983%2037.1354036%2C186.004604%2012.5289147%2C186.004604%20C8.28987161%2C186.004604%204.10888474%2C185.75646%200%2C185.271409%20C23.2431033%2C200.173139%2050.8507261%2C208.867532%2080.5109185%2C208.867532%20C177.116529%2C208.867532%20229.943977%2C128.836982%20229.943977%2C59.4326002%20C229.943977%2C57.1552968%20229.893412%2C54.8901664%20229.792282%2C52.6381454%20C240.053257%2C45.2331635%20248.958338%2C35.9825545%20256%2C25.4500259%22%20fill%3D%22%23efefef%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var GMail = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22193px%22%20viewBox%3D%220%200%20256%20193%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M58.1818182%2C192.049515%20L58.1818182%2C93.1404244%20L27.5066233%2C65.0770089%20L0%2C49.5040608%20L0%2C174.59497%20C0%2C184.253152%207.82545455%2C192.049515%2017.4545455%2C192.049515%20L58.1818182%2C192.049515%20Z%22%20fill%3D%22%23efefef%22%3E%3C%2Fpath%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M197.818182%2C192.049515%20L238.545455%2C192.049515%20C248.203636%2C192.049515%20256%2C184.224061%20256%2C174.59497%20L256%2C49.5040608%20L224.844415%2C67.3422767%20L197.818182%2C93.1404244%20L197.818182%2C192.049515%20Z%22%20fill%3D%22%23efefef%22%3E%3C%2Fpath%3E%20%20%20%20%20%20%20%20%3Cpolygon%20fill%3D%22%23efefef%22%20points%3D%2258.1818182%2093.1404244%2054.0077618%2054.4932827%2058.1818182%2017.5040608%20128%2069.8676972%20197.818182%2017.5040608%20202.487488%2052.4960089%20197.818182%2093.1404244%20128%20145.504061%22%3E%3C%2Fpolygon%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M197.818182%2C17.5040608%20L197.818182%2C93.1404244%20L256%2C49.5040608%20L256%2C26.2313335%20C256%2C4.64587897%20231.36%2C-7.65957557%20214.109091%2C5.28587897%20L197.818182%2C17.5040608%20Z%22%20fill%3D%22%23efefef%22%3E%3C%2Fpath%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M0%2C49.5040608%20L26.7588051%2C69.5731646%20L58.1818182%2C93.1404244%20L58.1818182%2C17.5040608%20L41.8909091%2C5.28587897%20C24.6109091%2C-7.65957557%200%2C4.64587897%200%2C26.2313335%20L0%2C49.5040608%20Z%22%20fill%3D%22%23efefef%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    var Medium = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22146px%22%20viewBox%3D%220%200%20256%20146%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M72.2009141%2C1.42108547e-14%20C112.076502%2C1.42108547e-14%20144.399375%2C32.5485469%20144.399375%2C72.6964154%20C144.399375%2C112.844284%20112.074049%2C145.390378%2072.2009141%2C145.390378%20C32.327779%2C145.390378%200%2C112.844284%200%2C72.6964154%20C0%2C32.5485469%2032.325326%2C1.42108547e-14%2072.2009141%2C1.42108547e-14%20Z%20M187.500628%2C4.25836743%20C207.438422%2C4.25836743%20223.601085%2C34.8960455%20223.601085%2C72.6964154%20L223.603538%2C72.6964154%20C223.603538%2C110.486973%20207.440875%2C141.134463%20187.503081%2C141.134463%20C167.565287%2C141.134463%20151.402624%2C110.486973%20151.402624%2C72.6964154%20C151.402624%2C34.9058574%20167.562834%2C4.25836743%20187.500628%2C4.25836743%20Z%20M243.303393%2C11.3867175%20C250.314%2C11.3867175%20256%2C38.835526%20256%2C72.6964154%20C256%2C106.547493%20250.316453%2C134.006113%20243.303393%2C134.006113%20C236.290333%2C134.006113%20230.609239%2C106.554852%20230.609239%2C72.6964154%20C230.609239%2C38.837979%20236.292786%2C11.3867175%20243.303393%2C11.3867175%20Z%22%20fill%3D%22%23efefef%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    /* src/SocialMedia.svelte generated by Svelte v3.50.1 */
    const file$3 = "src/SocialMedia.svelte";

    function create_fragment$4(ctx) {
    	let section5;
    	let subtitle;
    	let t0;
    	let figure0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let section4;
    	let section0;
    	let a0;
    	let figure1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let h40;
    	let t4;
    	let section1;
    	let a1;
    	let figure2;
    	let img2;
    	let img2_src_value;
    	let t5;
    	let h41;
    	let t7;
    	let section2;
    	let a2;
    	let figure3;
    	let img3;
    	let img3_src_value;
    	let t8;
    	let h42;
    	let t10;
    	let section3;
    	let a3;
    	let figure4;
    	let img4;
    	let img4_src_value;
    	let t11;
    	let h43;
    	let current;

    	subtitle = new Subtitle({
    			props: { content: "Contact with me" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section5 = element("section");
    			create_component(subtitle.$$.fragment);
    			t0 = space();
    			figure0 = element("figure");
    			img0 = element("img");
    			t1 = space();
    			section4 = element("section");
    			section0 = element("section");
    			a0 = element("a");
    			figure1 = element("figure");
    			img1 = element("img");
    			t2 = space();
    			h40 = element("h4");
    			h40.textContent = "GitHub";
    			t4 = space();
    			section1 = element("section");
    			a1 = element("a");
    			figure2 = element("figure");
    			img2 = element("img");
    			t5 = space();
    			h41 = element("h4");
    			h41.textContent = "LinkedIn";
    			t7 = space();
    			section2 = element("section");
    			a2 = element("a");
    			figure3 = element("figure");
    			img3 = element("img");
    			t8 = space();
    			h42 = element("h4");
    			h42.textContent = "GMail";
    			t10 = space();
    			section3 = element("section");
    			a3 = element("a");
    			figure4 = element("figure");
    			img4 = element("img");
    			t11 = space();
    			h43 = element("h4");
    			h43.textContent = "Medium";
    			if (!src_url_equal(img0.src, img0_src_value = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Beaming Face with Smiling Eyes");
    			attr_dev(img0, "width", "100");
    			attr_dev(img0, "height", "100");
    			add_location(img0, file$3, 12, 8, 429);
    			attr_dev(figure0, "class", "svelte-1tea8rf");
    			add_location(figure0, file$3, 11, 4, 412);
    			if (!src_url_equal(img1.src, img1_src_value = GitHub)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "GitHub icon");
    			attr_dev(img1, "class", "svelte-1tea8rf");
    			add_location(img1, file$3, 18, 20, 876);
    			attr_dev(figure1, "class", "svelte-1tea8rf");
    			add_location(figure1, file$3, 17, 16, 847);
    			attr_dev(h40, "class", "svelte-1tea8rf");
    			add_location(h40, file$3, 20, 16, 957);
    			attr_dev(a0, "href", "https://github.com/daniel692a");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener noreferrer");
    			attr_dev(a0, "class", "svelte-1tea8rf");
    			add_location(a0, file$3, 16, 12, 748);
    			attr_dev(section0, "class", "social-link svelte-1tea8rf");
    			add_location(section0, file$3, 15, 8, 706);
    			if (!src_url_equal(img2.src, img2_src_value = LinkedIn)) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "LinkedIn icon");
    			attr_dev(img2, "class", "svelte-1tea8rf");
    			add_location(img2, file$3, 26, 20, 1201);
    			attr_dev(figure2, "class", "svelte-1tea8rf");
    			add_location(figure2, file$3, 25, 16, 1172);
    			attr_dev(h41, "class", "svelte-1tea8rf");
    			add_location(h41, file$3, 28, 16, 1286);
    			attr_dev(a1, "href", "https://www.linkedin.com/in/danielarmasrmz/");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener noreferrer");
    			attr_dev(a1, "class", "svelte-1tea8rf");
    			add_location(a1, file$3, 24, 12, 1059);
    			attr_dev(section1, "class", "social-link svelte-1tea8rf");
    			add_location(section1, file$3, 23, 8, 1017);
    			if (!src_url_equal(img3.src, img3_src_value = GMail)) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "GMail icon");
    			attr_dev(img3, "class", "svelte-1tea8rf");
    			add_location(img3, file$3, 34, 20, 1519);
    			attr_dev(figure3, "class", "svelte-1tea8rf");
    			add_location(figure3, file$3, 33, 16, 1490);
    			attr_dev(h42, "class", "svelte-1tea8rf");
    			add_location(h42, file$3, 36, 16, 1598);
    			attr_dev(a2, "href", "mailto:daniel62armas@gmail.com");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "rel", "noopener noreferrer");
    			attr_dev(a2, "class", "svelte-1tea8rf");
    			add_location(a2, file$3, 32, 12, 1390);
    			attr_dev(section2, "class", "social-link svelte-1tea8rf");
    			add_location(section2, file$3, 31, 8, 1348);
    			if (!src_url_equal(img4.src, img4_src_value = Medium)) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Medium icon");
    			attr_dev(img4, "class", "svelte-1tea8rf");
    			add_location(img4, file$3, 42, 20, 1828);
    			attr_dev(figure4, "class", "svelte-1tea8rf");
    			add_location(figure4, file$3, 41, 16, 1799);
    			attr_dev(h43, "class", "svelte-1tea8rf");
    			add_location(h43, file$3, 44, 16, 1909);
    			attr_dev(a3, "href", "https://daniel692a.medium.com/");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "rel", "noopener noreferrer");
    			attr_dev(a3, "class", "svelte-1tea8rf");
    			add_location(a3, file$3, 40, 12, 1699);
    			attr_dev(section3, "class", "social-link svelte-1tea8rf");
    			add_location(section3, file$3, 39, 8, 1657);
    			attr_dev(section4, "class", "social-container svelte-1tea8rf");
    			add_location(section4, file$3, 14, 4, 663);
    			attr_dev(section5, "class", "social-media svelte-1tea8rf");
    			attr_dev(section5, "id", "contact");
    			add_location(section5, file$3, 9, 0, 311);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section5, anchor);
    			mount_component(subtitle, section5, null);
    			append_dev(section5, t0);
    			append_dev(section5, figure0);
    			append_dev(figure0, img0);
    			append_dev(section5, t1);
    			append_dev(section5, section4);
    			append_dev(section4, section0);
    			append_dev(section0, a0);
    			append_dev(a0, figure1);
    			append_dev(figure1, img1);
    			append_dev(a0, t2);
    			append_dev(a0, h40);
    			append_dev(section4, t4);
    			append_dev(section4, section1);
    			append_dev(section1, a1);
    			append_dev(a1, figure2);
    			append_dev(figure2, img2);
    			append_dev(a1, t5);
    			append_dev(a1, h41);
    			append_dev(section4, t7);
    			append_dev(section4, section2);
    			append_dev(section2, a2);
    			append_dev(a2, figure3);
    			append_dev(figure3, img3);
    			append_dev(a2, t8);
    			append_dev(a2, h42);
    			append_dev(section4, t10);
    			append_dev(section4, section3);
    			append_dev(section3, a3);
    			append_dev(a3, figure4);
    			append_dev(figure4, img4);
    			append_dev(a3, t11);
    			append_dev(a3, h43);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(subtitle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(subtitle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section5);
    			destroy_component(subtitle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SocialMedia', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SocialMedia> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Subtitle,
    		GitHub,
    		LinkedIn,
    		Twitter,
    		GMail,
    		Medium
    	});

    	return [];
    }

    class SocialMedia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$4, create_fragment$4, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SocialMedia",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var ESCOM = "f039a5ea8b49fb47.jpg";

    var ESCOM_1 = "f4a7a6fdedf634c1.jpg";

    var ESCOM_2 = "08439069a43ebd62.jpg";

    var ESCOM_3 = "d0b85033c354935f.jpg";

    var ESCOM_4 = "c7f9e8bb9edc2f3f.jpg";

    var ESCOM_5 = "2b36fef2305f8532.jpg";

    var ESCOM_6 = "dbd5632d6c5785cb.jpg";

    var FRIENDS = "81825df866c075ff.jpg";

    var PLATZI_1 = "90f960dae1c8d47c.jpg";

    var PLATZI = "4634b843d07ccf56.jpg";

    var PLATZI_2 = "3813a3254e04e2dd.jpg";

    var MLSA = "8122c839d7873561.png";

    var MLSA_1 = "04a75c2755f94961.jpg";

    var MLSA_2 = "6db585ed3f952de5.jpg";

    var STEM = "d40a1ed7de6c0218.png";

    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __commonJS = (cb, mod) => function __require() {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

    // node_modules/seedrandom/lib/alea.js
    var require_alea = __commonJS({
      "node_modules/seedrandom/lib/alea.js"(exports, module) {
        (function(global2, module2, define2) {
          function Alea(seed) {
            var me = this, mash = Mash();
            me.next = function() {
              var t = 2091639 * me.s0 + me.c * 23283064365386963e-26;
              me.s0 = me.s1;
              me.s1 = me.s2;
              return me.s2 = t - (me.c = t | 0);
            };
            me.c = 1;
            me.s0 = mash(" ");
            me.s1 = mash(" ");
            me.s2 = mash(" ");
            me.s0 -= mash(seed);
            if (me.s0 < 0) {
              me.s0 += 1;
            }
            me.s1 -= mash(seed);
            if (me.s1 < 0) {
              me.s1 += 1;
            }
            me.s2 -= mash(seed);
            if (me.s2 < 0) {
              me.s2 += 1;
            }
            mash = null;
          }
          function copy(f, t) {
            t.c = f.c;
            t.s0 = f.s0;
            t.s1 = f.s1;
            t.s2 = f.s2;
            return t;
          }
          function impl(seed, opts) {
            var xg = new Alea(seed), state = opts && opts.state, prng = xg.next;
            prng.int32 = function() {
              return xg.next() * 4294967296 | 0;
            };
            prng.double = function() {
              return prng() + (prng() * 2097152 | 0) * 11102230246251565e-32;
            };
            prng.quick = prng;
            if (state) {
              if (typeof state == "object")
                copy(state, xg);
              prng.state = function() {
                return copy(xg, {});
              };
            }
            return prng;
          }
          function Mash() {
            var n = 4022871197;
            var mash = function(data) {
              data = String(data);
              for (var i = 0; i < data.length; i++) {
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 4294967296;
              }
              return (n >>> 0) * 23283064365386963e-26;
            };
            return mash;
          }
          if (module2 && module2.exports) {
            module2.exports = impl;
          } else if (define2 && define2.amd) {
            define2(function() {
              return impl;
            });
          } else {
            this.alea = impl;
          }
        })(exports, typeof module == "object" && module, typeof define == "function" && define);
      }
    });

    // node_modules/seedrandom/lib/xor128.js
    var require_xor128 = __commonJS({
      "node_modules/seedrandom/lib/xor128.js"(exports, module) {
        (function(global2, module2, define2) {
          function XorGen(seed) {
            var me = this, strseed = "";
            me.x = 0;
            me.y = 0;
            me.z = 0;
            me.w = 0;
            me.next = function() {
              var t = me.x ^ me.x << 11;
              me.x = me.y;
              me.y = me.z;
              me.z = me.w;
              return me.w ^= me.w >>> 19 ^ t ^ t >>> 8;
            };
            if (seed === (seed | 0)) {
              me.x = seed;
            } else {
              strseed += seed;
            }
            for (var k = 0; k < strseed.length + 64; k++) {
              me.x ^= strseed.charCodeAt(k) | 0;
              me.next();
            }
          }
          function copy(f, t) {
            t.x = f.x;
            t.y = f.y;
            t.z = f.z;
            t.w = f.w;
            return t;
          }
          function impl(seed, opts) {
            var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
              return (xg.next() >>> 0) / 4294967296;
            };
            prng.double = function() {
              do {
                var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
              } while (result === 0);
              return result;
            };
            prng.int32 = xg.next;
            prng.quick = prng;
            if (state) {
              if (typeof state == "object")
                copy(state, xg);
              prng.state = function() {
                return copy(xg, {});
              };
            }
            return prng;
          }
          if (module2 && module2.exports) {
            module2.exports = impl;
          } else if (define2 && define2.amd) {
            define2(function() {
              return impl;
            });
          } else {
            this.xor128 = impl;
          }
        })(exports, typeof module == "object" && module, typeof define == "function" && define);
      }
    });

    // node_modules/seedrandom/lib/xorwow.js
    var require_xorwow = __commonJS({
      "node_modules/seedrandom/lib/xorwow.js"(exports, module) {
        (function(global2, module2, define2) {
          function XorGen(seed) {
            var me = this, strseed = "";
            me.next = function() {
              var t = me.x ^ me.x >>> 2;
              me.x = me.y;
              me.y = me.z;
              me.z = me.w;
              me.w = me.v;
              return (me.d = me.d + 362437 | 0) + (me.v = me.v ^ me.v << 4 ^ (t ^ t << 1)) | 0;
            };
            me.x = 0;
            me.y = 0;
            me.z = 0;
            me.w = 0;
            me.v = 0;
            if (seed === (seed | 0)) {
              me.x = seed;
            } else {
              strseed += seed;
            }
            for (var k = 0; k < strseed.length + 64; k++) {
              me.x ^= strseed.charCodeAt(k) | 0;
              if (k == strseed.length) {
                me.d = me.x << 10 ^ me.x >>> 4;
              }
              me.next();
            }
          }
          function copy(f, t) {
            t.x = f.x;
            t.y = f.y;
            t.z = f.z;
            t.w = f.w;
            t.v = f.v;
            t.d = f.d;
            return t;
          }
          function impl(seed, opts) {
            var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
              return (xg.next() >>> 0) / 4294967296;
            };
            prng.double = function() {
              do {
                var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
              } while (result === 0);
              return result;
            };
            prng.int32 = xg.next;
            prng.quick = prng;
            if (state) {
              if (typeof state == "object")
                copy(state, xg);
              prng.state = function() {
                return copy(xg, {});
              };
            }
            return prng;
          }
          if (module2 && module2.exports) {
            module2.exports = impl;
          } else if (define2 && define2.amd) {
            define2(function() {
              return impl;
            });
          } else {
            this.xorwow = impl;
          }
        })(exports, typeof module == "object" && module, typeof define == "function" && define);
      }
    });

    // node_modules/seedrandom/lib/xorshift7.js
    var require_xorshift7 = __commonJS({
      "node_modules/seedrandom/lib/xorshift7.js"(exports, module) {
        (function(global2, module2, define2) {
          function XorGen(seed) {
            var me = this;
            me.next = function() {
              var X = me.x, i = me.i, t, v;
              t = X[i];
              t ^= t >>> 7;
              v = t ^ t << 24;
              t = X[i + 1 & 7];
              v ^= t ^ t >>> 10;
              t = X[i + 3 & 7];
              v ^= t ^ t >>> 3;
              t = X[i + 4 & 7];
              v ^= t ^ t << 7;
              t = X[i + 7 & 7];
              t = t ^ t << 13;
              v ^= t ^ t << 9;
              X[i] = v;
              me.i = i + 1 & 7;
              return v;
            };
            function init2(me2, seed2) {
              var j, X = [];
              if (seed2 === (seed2 | 0)) {
                X[0] = seed2;
              } else {
                seed2 = "" + seed2;
                for (j = 0; j < seed2.length; ++j) {
                  X[j & 7] = X[j & 7] << 15 ^ seed2.charCodeAt(j) + X[j + 1 & 7] << 13;
                }
              }
              while (X.length < 8)
                X.push(0);
              for (j = 0; j < 8 && X[j] === 0; ++j)
                ;
              if (j == 8)
                X[7] = -1;
              me2.x = X;
              me2.i = 0;
              for (j = 256; j > 0; --j) {
                me2.next();
              }
            }
            init2(me, seed);
          }
          function copy(f, t) {
            t.x = f.x.slice();
            t.i = f.i;
            return t;
          }
          function impl(seed, opts) {
            if (seed == null)
              seed = +new Date();
            var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
              return (xg.next() >>> 0) / 4294967296;
            };
            prng.double = function() {
              do {
                var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
              } while (result === 0);
              return result;
            };
            prng.int32 = xg.next;
            prng.quick = prng;
            if (state) {
              if (state.x)
                copy(state, xg);
              prng.state = function() {
                return copy(xg, {});
              };
            }
            return prng;
          }
          if (module2 && module2.exports) {
            module2.exports = impl;
          } else if (define2 && define2.amd) {
            define2(function() {
              return impl;
            });
          } else {
            this.xorshift7 = impl;
          }
        })(exports, typeof module == "object" && module, typeof define == "function" && define);
      }
    });

    // node_modules/seedrandom/lib/xor4096.js
    var require_xor4096 = __commonJS({
      "node_modules/seedrandom/lib/xor4096.js"(exports, module) {
        (function(global2, module2, define2) {
          function XorGen(seed) {
            var me = this;
            me.next = function() {
              var w = me.w, X = me.X, i = me.i, t, v;
              me.w = w = w + 1640531527 | 0;
              v = X[i + 34 & 127];
              t = X[i = i + 1 & 127];
              v ^= v << 13;
              t ^= t << 17;
              v ^= v >>> 15;
              t ^= t >>> 12;
              v = X[i] = v ^ t;
              me.i = i;
              return v + (w ^ w >>> 16) | 0;
            };
            function init2(me2, seed2) {
              var t, v, i, j, w, X = [], limit = 128;
              if (seed2 === (seed2 | 0)) {
                v = seed2;
                seed2 = null;
              } else {
                seed2 = seed2 + "\0";
                v = 0;
                limit = Math.max(limit, seed2.length);
              }
              for (i = 0, j = -32; j < limit; ++j) {
                if (seed2)
                  v ^= seed2.charCodeAt((j + 32) % seed2.length);
                if (j === 0)
                  w = v;
                v ^= v << 10;
                v ^= v >>> 15;
                v ^= v << 4;
                v ^= v >>> 13;
                if (j >= 0) {
                  w = w + 1640531527 | 0;
                  t = X[j & 127] ^= v + w;
                  i = t == 0 ? i + 1 : 0;
                }
              }
              if (i >= 128) {
                X[(seed2 && seed2.length || 0) & 127] = -1;
              }
              i = 127;
              for (j = 4 * 128; j > 0; --j) {
                v = X[i + 34 & 127];
                t = X[i = i + 1 & 127];
                v ^= v << 13;
                t ^= t << 17;
                v ^= v >>> 15;
                t ^= t >>> 12;
                X[i] = v ^ t;
              }
              me2.w = w;
              me2.X = X;
              me2.i = i;
            }
            init2(me, seed);
          }
          function copy(f, t) {
            t.i = f.i;
            t.w = f.w;
            t.X = f.X.slice();
            return t;
          }
          function impl(seed, opts) {
            if (seed == null)
              seed = +new Date();
            var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
              return (xg.next() >>> 0) / 4294967296;
            };
            prng.double = function() {
              do {
                var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
              } while (result === 0);
              return result;
            };
            prng.int32 = xg.next;
            prng.quick = prng;
            if (state) {
              if (state.X)
                copy(state, xg);
              prng.state = function() {
                return copy(xg, {});
              };
            }
            return prng;
          }
          if (module2 && module2.exports) {
            module2.exports = impl;
          } else if (define2 && define2.amd) {
            define2(function() {
              return impl;
            });
          } else {
            this.xor4096 = impl;
          }
        })(exports, typeof module == "object" && module, typeof define == "function" && define);
      }
    });

    // node_modules/seedrandom/lib/tychei.js
    var require_tychei = __commonJS({
      "node_modules/seedrandom/lib/tychei.js"(exports, module) {
        (function(global2, module2, define2) {
          function XorGen(seed) {
            var me = this, strseed = "";
            me.next = function() {
              var b = me.b, c = me.c, d = me.d, a = me.a;
              b = b << 25 ^ b >>> 7 ^ c;
              c = c - d | 0;
              d = d << 24 ^ d >>> 8 ^ a;
              a = a - b | 0;
              me.b = b = b << 20 ^ b >>> 12 ^ c;
              me.c = c = c - d | 0;
              me.d = d << 16 ^ c >>> 16 ^ a;
              return me.a = a - b | 0;
            };
            me.a = 0;
            me.b = 0;
            me.c = 2654435769 | 0;
            me.d = 1367130551;
            if (seed === Math.floor(seed)) {
              me.a = seed / 4294967296 | 0;
              me.b = seed | 0;
            } else {
              strseed += seed;
            }
            for (var k = 0; k < strseed.length + 20; k++) {
              me.b ^= strseed.charCodeAt(k) | 0;
              me.next();
            }
          }
          function copy(f, t) {
            t.a = f.a;
            t.b = f.b;
            t.c = f.c;
            t.d = f.d;
            return t;
          }
          function impl(seed, opts) {
            var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
              return (xg.next() >>> 0) / 4294967296;
            };
            prng.double = function() {
              do {
                var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
              } while (result === 0);
              return result;
            };
            prng.int32 = xg.next;
            prng.quick = prng;
            if (state) {
              if (typeof state == "object")
                copy(state, xg);
              prng.state = function() {
                return copy(xg, {});
              };
            }
            return prng;
          }
          if (module2 && module2.exports) {
            module2.exports = impl;
          } else if (define2 && define2.amd) {
            define2(function() {
              return impl;
            });
          } else {
            this.tychei = impl;
          }
        })(exports, typeof module == "object" && module, typeof define == "function" && define);
      }
    });

    // (disabled):crypto
    var require_crypto = __commonJS({
      "(disabled):crypto"() {
      }
    });

    // node_modules/seedrandom/seedrandom.js
    var require_seedrandom = __commonJS({
      "node_modules/seedrandom/seedrandom.js"(exports, module) {
        (function(global2, pool, math) {
          var width = 256, chunks = 6, digits = 52, rngname = "random", startdenom = math.pow(width, chunks), significance = math.pow(2, digits), overflow = significance * 2, mask = width - 1, nodecrypto;
          function seedrandom2(seed, options, callback) {
            var key = [];
            options = options == true ? { entropy: true } : options || {};
            var shortseed = mixkey(flatten(options.entropy ? [seed, tostring(pool)] : seed == null ? autoseed() : seed, 3), key);
            var arc4 = new ARC4(key);
            var prng = function() {
              var n = arc4.g(chunks), d = startdenom, x = 0;
              while (n < significance) {
                n = (n + x) * width;
                d *= width;
                x = arc4.g(1);
              }
              while (n >= overflow) {
                n /= 2;
                d /= 2;
                x >>>= 1;
              }
              return (n + x) / d;
            };
            prng.int32 = function() {
              return arc4.g(4) | 0;
            };
            prng.quick = function() {
              return arc4.g(4) / 4294967296;
            };
            prng.double = prng;
            mixkey(tostring(arc4.S), pool);
            return (options.pass || callback || function(prng2, seed2, is_math_call, state) {
              if (state) {
                if (state.S) {
                  copy(state, arc4);
                }
                prng2.state = function() {
                  return copy(arc4, {});
                };
              }
              if (is_math_call) {
                math[rngname] = prng2;
                return seed2;
              } else
                return prng2;
            })(prng, shortseed, "global" in options ? options.global : this == math, options.state);
          }
          function ARC4(key) {
            var t, keylen = key.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
            if (!keylen) {
              key = [keylen++];
            }
            while (i < width) {
              s[i] = i++;
            }
            for (i = 0; i < width; i++) {
              s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
              s[j] = t;
            }
            (me.g = function(count) {
              var t2, r = 0, i2 = me.i, j2 = me.j, s2 = me.S;
              while (count--) {
                t2 = s2[i2 = mask & i2 + 1];
                r = r * width + s2[mask & (s2[i2] = s2[j2 = mask & j2 + t2]) + (s2[j2] = t2)];
              }
              me.i = i2;
              me.j = j2;
              return r;
            })(width);
          }
          function copy(f, t) {
            t.i = f.i;
            t.j = f.j;
            t.S = f.S.slice();
            return t;
          }
          function flatten(obj, depth) {
            var result = [], typ = typeof obj, prop;
            if (depth && typ == "object") {
              for (prop in obj) {
                try {
                  result.push(flatten(obj[prop], depth - 1));
                } catch (e) {
                }
              }
            }
            return result.length ? result : typ == "string" ? obj : obj + "\0";
          }
          function mixkey(seed, key) {
            var stringseed = seed + "", smear, j = 0;
            while (j < stringseed.length) {
              key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
            }
            return tostring(key);
          }
          function autoseed() {
            try {
              var out;
              if (nodecrypto && (out = nodecrypto.randomBytes)) {
                out = out(width);
              } else {
                out = new Uint8Array(width);
                (global2.crypto || global2.msCrypto).getRandomValues(out);
              }
              return tostring(out);
            } catch (e) {
              var browser = global2.navigator, plugins = browser && browser.plugins;
              return [+new Date(), global2, plugins, global2.screen, tostring(pool)];
            }
          }
          function tostring(a) {
            return String.fromCharCode.apply(0, a);
          }
          mixkey(math.random(), pool);
          if (typeof module == "object" && module.exports) {
            module.exports = seedrandom2;
            try {
              nodecrypto = require_crypto();
            } catch (ex) {
            }
          } else if (typeof define == "function" && define.amd) {
            define(function() {
              return seedrandom2;
            });
          } else {
            math["seed" + rngname] = seedrandom2;
          }
        })(typeof self !== "undefined" ? self : exports, [], Math);
      }
    });

    // node_modules/seedrandom/index.js
    var require_seedrandom2 = __commonJS({
      "node_modules/seedrandom/index.js"(exports, module) {
        var alea = require_alea();
        var xor128 = require_xor128();
        var xorwow = require_xorwow();
        var xorshift7 = require_xorshift7();
        var xor4096 = require_xor4096();
        var tychei = require_tychei();
        var sr = require_seedrandom();
        sr.alea = alea;
        sr.xor128 = xor128;
        sr.xorwow = xorwow;
        sr.xorshift7 = xorshift7;
        sr.xor4096 = xor4096;
        sr.tychei = tychei;
        module.exports = sr;
      }
    });

    // src/internal/config.ts
    var init = {
      disable: false,
      debug: false,
      ref: "",
      highlightLogs: false,
      highlightColor: "tomato",
      root: null,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      threshold: 0.6,
      transition: "fly",
      reset: false,
      delay: 0,
      duration: 800,
      easing: "custom",
      customEasing: [0.25, 0.1, 0.25, 0.1],
      x: -20,
      y: -20,
      rotate: -360,
      opacity: 0,
      blur: 16,
      scale: 0,
      onRevealStart: () => null,
      onRevealEnd: () => null,
      onResetStart: () => null,
      onResetEnd: () => null,
      onMount: () => null,
      onUpdate: () => null,
      onDestroy: () => null
    };
    var config = {
      dev: true,
      once: false,
      responsive: {
        mobile: {
          enabled: true,
          breakpoint: 425
        },
        tablet: {
          enabled: true,
          breakpoint: 768
        },
        laptop: {
          enabled: true,
          breakpoint: 1440
        },
        desktop: {
          enabled: true,
          breakpoint: 2560
        }
      },
      observer: {
        root: init.root,
        rootMargin: `${init.marginTop}px ${init.marginRight}px ${init.marginBottom}px ${init.marginLeft}px`,
        threshold: init.threshold
      }
    };

    // src/internal/validations.ts
    var hasValidRange = (property, min, max) => {
      return property >= min && property <= max;
    };
    var isPositive = (property) => property >= 0;
    var isPositiveInteger = (property) => {
      return isPositive(property) && Number.isInteger(property);
    };
    var checkOptions = (options) => {
      const finalOptions = Object.assign({}, init, options);
      const { threshold, opacity, delay, duration, blur, scale } = finalOptions;
      if (hasValidRange(threshold, 0, 1) && hasValidRange(opacity, 0, 1) && isPositive(delay) && isPositive(duration) && isPositive(blur) && isPositive(scale)) {
        return finalOptions;
      }
      throw new Error("Invalid options");
    };

    // src/internal/styling/breakpoints.ts
    var hasOverlappingBreakpoints = (responsive) => {
      const { mobile, tablet, laptop, desktop } = responsive;
      return mobile.breakpoint > tablet.breakpoint || tablet.breakpoint > laptop.breakpoint || laptop.breakpoint > desktop.breakpoint;
    };
    var hasValidBreakpoints = (responsive) => {
      const breakpoints = Object.values(responsive).map((device) => device.breakpoint);
      breakpoints.forEach((breakpoint) => {
        if (!isPositiveInteger(breakpoint)) {
          throw new Error("Breakpoints must be positive integers");
        }
      });
      if (hasOverlappingBreakpoints(responsive)) {
        throw new Error("Breakpoints can't overlap");
      }
      return true;
    };

    // src/internal/styling/classesGeneration.ts
    var import_seedrandom = __toESM(require_seedrandom2(), 1);
    var clean = (styles) => styles.trim().replace(/[\n|\t]/g, "").replace(/\s(\s+)/g, " ");

    // src/internal/styling/mediaQueries.ts
    var createQuery = (devices, i, beginning, end) => {
      const smallest = Math.min(...devices.map(([, settings]) => settings.breakpoint));
      const largest = Math.max(...devices.map(([, settings]) => settings.breakpoint));
      let query;
      if (beginning === smallest) {
        query = `(max-width: ${end}px)`;
      } else {
        const previous = devices[i - 1][1];
        if (end === largest) {
          query = `(min-width: ${previous.breakpoint + 1}px)`;
        } else {
          query = `(min-width: ${previous.breakpoint + 1}px) and (max-width: ${end}px)`;
        }
      }
      return query;
    };
    var findOptimalQueries = (devices) => {
      const queries = [];
      let i = 0;
      while (i < devices.length) {
        if (devices[i][1].enabled) {
          let j = i;
          let query = "";
          while (j < devices.length && devices[j][1].enabled) {
            const beginning = devices[i][1].breakpoint;
            const end = devices[j][1].breakpoint;
            query = createQuery(devices, i, beginning, end);
            j++;
          }
          queries.push(query);
          i = j;
        } else {
          i++;
        }
      }
      return queries;
    };
    var addMediaQueries = (styles, responsive = config.responsive) => {
      const devices = Object.entries(responsive);
      const allDevicesEnabled = devices.every(([, settings]) => settings.enabled);
      const allDevicesDisabled = devices.every(([, settings]) => !settings.enabled);
      if (allDevicesEnabled)
        return styles;
      if (allDevicesDisabled) {
        return clean(`
		@media not all {
			${styles}
		}
	`);
      }
      hasValidBreakpoints(responsive);
      return clean(`
		@media ${findOptimalQueries(devices).join(", ")} {
			${styles}
		}
	`);
    };

    // src/internal/DOM.ts
    var markRevealNode = (revealNode) => {
      revealNode.setAttribute("data-action", "reveal");
      return revealNode;
    };
    var activateRevealNode = (revealNode, className, baseClassName, options) => {
      markRevealNode(revealNode);
      const mainCss = createMainCss(className, options);
      const transitionCss = createTransitionCss(baseClassName, options);
      const stylesheet = document.querySelector('style[data-action="reveal"]');
      if (stylesheet) {
        const newStyles = getUpdatedStyles(stylesheet.innerHTML, clean(mainCss), clean(transitionCss));
        stylesheet.innerHTML = newStyles;
        revealNode.classList.add(className);
        revealNode.classList.add(baseClassName);
      }
      return revealNode;
    };
    var getRevealNode = (node) => {
      let revealNode;
      if (node.style.length === 0) {
        revealNode = node;
      } else {
        const wrapper = document.createElement("div");
        wrapper.appendChild(node);
        revealNode = wrapper;
      }
      return revealNode;
    };
    var createObserver = (canDebug, highlightText, revealNode, options, className) => {
      const { ref, reset, duration, delay, threshold, onResetStart, onResetEnd, onRevealEnd } = options;
      return new IntersectionObserver((entries, observer) => {
        if (canDebug) {
          const entry = entries[0];
          const entryTarget = entry.target;
          if (entryTarget === revealNode) {
            console.groupCollapsed(`%cRef: ${ref} (Intersection Observer Callback)`, highlightText);
            console.log(entry);
            console.groupEnd();
          }
        }
        entries.forEach((entry) => {
          if (reset && !entry.isIntersecting) {
            onResetStart(revealNode);
            revealNode.classList.add(className);
            setTimeout(() => onResetEnd(revealNode), duration + delay);
          } else if (entry.intersectionRatio >= threshold) {
            setTimeout(() => onRevealEnd(revealNode), duration + delay);
            revealNode.classList.remove(className);
            if (!reset)
              observer.unobserve(revealNode);
          }
        });
      }, config.observer);
    };
    var logInfo = (finalOptions, revealNode) => {
      const { debug, ref, highlightLogs, highlightColor } = finalOptions;
      const canDebug = config.dev && debug && ref !== "";
      const highlightText = `color: ${highlightLogs ? highlightColor : "#B4BEC8"}`;
      if (canDebug) {
        console.groupCollapsed(`%cRef: ${ref}`, highlightText);
        console.groupCollapsed("%cNode", highlightText);
        console.log(revealNode);
        console.groupEnd();
        console.groupCollapsed("%cConfig", highlightText);
        console.log(config);
        console.groupEnd();
        console.groupCollapsed("%cOptions", highlightText);
        console.log(finalOptions);
        console.groupEnd();
      }
      return [canDebug, highlightText];
    };

    // src/internal/styling/stylesExtraction.ts
    var extractCssRules = (styles) => {
      return clean(styles).split(";").filter((rule) => rule !== "").map((rule) => rule.trim());
    };
    var sanitizeStyles = (styles) => {
      return extractCssRules(styles).join("; ").concat("; ");
    };

    // src/internal/styling/stylesGeneration.ts
    var createStylesheet = () => {
      const style = document.createElement("style");
      style.setAttribute("type", "text/css");
      markRevealNode(style);
      const head = document.querySelector("head");
      if (head !== null)
        head.appendChild(style);
    };
    var addVendors = (unprefixedStyles) => {
      const rules = extractCssRules(unprefixedStyles);
      let prefixedStyles = "";
      rules.forEach((rule) => {
        const [property, value] = rule.trim().split(":").map((x) => x.trim());
        prefixedStyles += sanitizeStyles(`
			-webkit-${property}: ${value};
			-ms-${property}: ${value};
			${property}: ${value};
		`);
      });
      return prefixedStyles.trim();
    };

    // src/internal/styling/stylesRetrieval.ts
    var getUpdatedStyles = (oldStyles, mainCss, transitionCss) => {
      const prevStyles = getMinifiedStylesFromQuery(oldStyles);
      const newStyles = clean([mainCss, transitionCss].join(" "));
      const decorated = addMediaQueries([prevStyles, newStyles].join(" "));
      return decorated.trim();
    };
    var getMinifiedStylesFromQuery = (query) => {
      const cleaned = clean(query.trim());
      if (cleaned === "" || !cleaned.startsWith("@media"))
        return cleaned;
      return clean(cleaned.replace(/{/, "___").split("___")[1].slice(0, -1).trim());
    };
    var getCssRules = (transition, options) => {
      const { x, y, rotate, opacity, blur, scale } = Object.assign({}, init, options);
      let styles = "";
      if (transition === "fly") {
        styles = `
			opacity: ${opacity};
			transform: translateY(${y}px);
		`;
      } else if (transition === "fade") {
        styles = `
			opacity: ${opacity};
		`;
      } else if (transition === "blur") {
        styles = `
			opacity: ${opacity};
			filter: blur(${blur}px);
		`;
      } else if (transition === "scale") {
        styles = `
			opacity: ${opacity};
			transform: scale(${scale});
		`;
      } else if (transition === "slide") {
        styles = `
			opacity: ${opacity};
			transform: translateX(${x}px);
		`;
      } else if (transition === "spin") {
        styles = `
			opacity: ${opacity};
			transform: rotate(${rotate}deg);
		`;
      } else {
        throw new Error("Invalid CSS class name");
      }
      return addVendors(styles);
    };
    var getEasing = (easing, customEasing) => {
      const weightsObj = {
        linear: [0, 0, 1, 1],
        easeInSine: [0.12, 0, 0.39, 0],
        easeOutSine: [0.61, 1, 0.88, 1],
        easeInOutSine: [0.37, 0, 0.63, 1],
        easeInQuad: [0.11, 0, 0.5, 0],
        easeOutQuad: [0.5, 1, 0.89, 1],
        easeInOutQuad: [0.45, 0, 0.55, 1],
        easeInCubic: [0.32, 0, 0.67, 0],
        easeOutCubic: [0.33, 1, 0.68, 1],
        easeInOutCubic: [0.65, 0, 0.35, 1],
        easeInQuart: [0.5, 0, 0.75, 0],
        easeOutQuart: [0.25, 1, 0.5, 1],
        easeInOutQuart: [0.76, 0, 0.24, 1],
        easeInQuint: [0.64, 0, 0.78, 0],
        easeOutQuint: [0.22, 1, 0.36, 1],
        easeInOutQuint: [0.83, 0, 0.17, 1],
        easeInExpo: [0.7, 0, 0.84, 0],
        easeOutExpo: [0.16, 1, 0.3, 1],
        easeInOutExpo: [0.87, 0, 0.13, 1],
        easeInCirc: [0.55, 0, 1, 0.45],
        easeOutCirc: [0, 0.55, 0.45, 1],
        easeInOutCirc: [0.85, 0, 0.15, 1],
        easeInBack: [0.36, 0, 0.66, -0.56],
        easeOutBack: [0.34, 1.56, 0.64, 1],
        easeInOutBack: [0.68, -0.6, 0.32, 1.6]
      };
      let weights;
      if (easing === "custom" && customEasing !== void 0) {
        weights = customEasing;
      } else if (easing !== "custom" && Object.keys(weightsObj).includes(easing)) {
        weights = weightsObj[easing];
      } else {
        throw new Error("Invalid easing function");
      }
      return `cubic-bezier(${weights.join(", ")})`;
    };

    // src/internal/styling/classesGeneration.ts
    var createClassNames = (ref, transitionClass, transition) => {
      const tokens = [ref, transitionClass ? "base" : "", transition];
      const validTokens = tokens.filter((x) => x && x !== "");
      const prefix = `sr__${validTokens.join("__")}__`;
      const seed = document.querySelectorAll('[data-action="reveal"]').length;
      const uid = (0, import_seedrandom.default)(seed.toString())();
      return `${prefix}${uid.toString().slice(2)}`;
    };
    var createMainCss = (className, options) => {
      const { transition } = options;
      return `
		.${className} {
			${getCssRules(transition, options)}
		}
	`;
    };
    var createTransitionCss = (className, options) => {
      const { duration, delay, easing, customEasing } = options;
      const styles = `
		transition: all ${duration / 1e3}s ${delay / 1e3}s ${getEasing(easing, customEasing)};
	`;
      return `
		.${className} {
			${styles.trim()}
		}
	`;
    };

    // node_modules/svelte/internal/index.mjs
    function noop() {
    }
    function safe_not_equal(a, b) {
      return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
    }
    Promise.resolve();

    // node_modules/svelte/store/index.mjs
    var subscriber_queue = [];
    function writable(value, start = noop) {
      let stop;
      const subscribers = /* @__PURE__ */ new Set();
      function set(new_value) {
        if (safe_not_equal(value, new_value)) {
          value = new_value;
          if (stop) {
            const run_queue = !subscriber_queue.length;
            for (const subscriber of subscribers) {
              subscriber[1]();
              subscriber_queue.push(subscriber, value);
            }
            if (run_queue) {
              for (let i = 0; i < subscriber_queue.length; i += 2) {
                subscriber_queue[i][0](subscriber_queue[i + 1]);
              }
              subscriber_queue.length = 0;
            }
          }
        }
      }
      function update(fn) {
        set(fn(value));
      }
      function subscribe2(run2, invalidate = noop) {
        const subscriber = [run2, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
          stop = start(set) || noop;
        }
        run2(value);
        return () => {
          subscribers.delete(subscriber);
          if (subscribers.size === 0) {
            stop();
            stop = null;
          }
        };
      }
      return { set, update, subscribe: subscribe2 };
    }

    // src/internal/stores.ts
    var styleTagStore = writable(false);
    var reloadStore = writable(false);

    // src/internal/reveal.ts
    var reveal = (node, options = init) => {
      const finalOptions = checkOptions(options);
      const { transition, disable, ref, onRevealStart, onMount, onUpdate, onDestroy } = finalOptions;
      const revealNode = getRevealNode(node);
      const className = createClassNames(ref, false, transition);
      const baseClassName = createClassNames(ref, true, transition);
      onMount(revealNode);
      const [canDebug, highlightText] = logInfo(finalOptions, revealNode);
      let reloaded = false;
      const unsubscribeReloaded = reloadStore.subscribe((value) => reloaded = value);
      const navigation = window.performance.getEntriesByType("navigation");
      let navigationType = "";
      if (navigation.length > 0) {
        navigationType = navigation[0].type;
      } else {
        navigationType = window.performance.navigation.type;
      }
      if (navigationType === "reload" || navigationType === 1)
        reloadStore.set(true);
      if (disable || config.once && reloaded)
        return {};
      let styleTagExists = false;
      const unsubscribeStyleTag = styleTagStore.subscribe((value) => styleTagExists = value);
      if (!styleTagExists) {
        createStylesheet();
        styleTagStore.set(true);
      }
      onRevealStart(revealNode);
      activateRevealNode(revealNode, className, baseClassName, finalOptions);
      const ObserverInstance = createObserver(canDebug, highlightText, revealNode, finalOptions, className);
      ObserverInstance.observe(revealNode);
      console.groupEnd();
      return {
        update() {
          onUpdate(revealNode);
        },
        destroy() {
          onDestroy(revealNode);
          unsubscribeStyleTag();
          unsubscribeReloaded();
        }
      };
    };

    /* src/Gallery.svelte generated by Svelte v3.50.1 */
    const file$2 = "src/Gallery.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let figure0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let figure1;
    	let h10;
    	let t2;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let figure2;
    	let h11;
    	let t5;
    	let img2;
    	let img2_src_value;
    	let t6;
    	let figure3;
    	let img3;
    	let img3_src_value;
    	let t7;
    	let figure4;
    	let img4;
    	let img4_src_value;
    	let t8;
    	let figure5;
    	let h12;
    	let t10;
    	let img5;
    	let img5_src_value;
    	let t11;
    	let figure6;
    	let h13;
    	let t13;
    	let img6;
    	let img6_src_value;
    	let t14;
    	let figure7;
    	let img7;
    	let img7_src_value;
    	let t15;
    	let figure8;
    	let img8;
    	let img8_src_value;
    	let t16;
    	let figure9;
    	let h14;
    	let t18;
    	let img9;
    	let img9_src_value;
    	let t19;
    	let figure10;
    	let img10;
    	let img10_src_value;
    	let t20;
    	let figure11;
    	let img11;
    	let img11_src_value;
    	let t21;
    	let figure12;
    	let img12;
    	let img12_src_value;
    	let t22;
    	let figure13;
    	let img13;
    	let img13_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			figure0 = element("figure");
    			img0 = element("img");
    			t0 = space();
    			figure1 = element("figure");
    			h10 = element("h1");
    			h10.textContent = "Making";
    			t2 = space();
    			img1 = element("img");
    			t3 = space();
    			figure2 = element("figure");
    			h11 = element("h1");
    			h11.textContent = "an";
    			t5 = space();
    			img2 = element("img");
    			t6 = space();
    			figure3 = element("figure");
    			img3 = element("img");
    			t7 = space();
    			figure4 = element("figure");
    			img4 = element("img");
    			t8 = space();
    			figure5 = element("figure");
    			h12 = element("h1");
    			h12.textContent = "Impact";
    			t10 = space();
    			img5 = element("img");
    			t11 = space();
    			figure6 = element("figure");
    			h13 = element("h1");
    			h13.textContent = "with";
    			t13 = space();
    			img6 = element("img");
    			t14 = space();
    			figure7 = element("figure");
    			img7 = element("img");
    			t15 = space();
    			figure8 = element("figure");
    			img8 = element("img");
    			t16 = space();
    			figure9 = element("figure");
    			h14 = element("h1");
    			h14.textContent = "technology";
    			t18 = space();
    			img9 = element("img");
    			t19 = space();
    			figure10 = element("figure");
    			img10 = element("img");
    			t20 = space();
    			figure11 = element("figure");
    			img11 = element("img");
    			t21 = space();
    			figure12 = element("figure");
    			img12 = element("img");
    			t22 = space();
    			figure13 = element("figure");
    			img13 = element("img");
    			if (!src_url_equal(img0.src, img0_src_value = PLATZI_1)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Platzi event with my firends");
    			attr_dev(img0, "class", "svelte-eo8p7h");
    			add_location(img0, file$2, 23, 8, 952);
    			attr_dev(figure0, "class", "svelte-eo8p7h");
    			add_location(figure0, file$2, 22, 4, 899);
    			attr_dev(h10, "class", "svelte-eo8p7h");
    			add_location(h10, file$2, 26, 8, 1077);
    			if (!src_url_equal(img1.src, img1_src_value = ESCOM_1)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Platzi event with my firends");
    			attr_dev(img1, "class", "svelte-eo8p7h");
    			add_location(img1, file$2, 27, 8, 1101);
    			attr_dev(figure1, "class", "svelte-eo8p7h");
    			add_location(figure1, file$2, 25, 4, 1026);
    			attr_dev(h11, "class", "svelte-eo8p7h");
    			add_location(h11, file$2, 30, 8, 1227);
    			if (!src_url_equal(img2.src, img2_src_value = PLATZI_2)) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Platzi event with my firends");
    			attr_dev(img2, "class", "svelte-eo8p7h");
    			add_location(img2, file$2, 31, 8, 1247);
    			attr_dev(figure2, "class", "svelte-eo8p7h");
    			add_location(figure2, file$2, 29, 4, 1174);
    			if (!src_url_equal(img3.src, img3_src_value = ESCOM_2)) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Platzi event with my firends");
    			attr_dev(img3, "class", "svelte-eo8p7h");
    			add_location(img3, file$2, 34, 8, 1372);
    			attr_dev(figure3, "class", "svelte-eo8p7h");
    			add_location(figure3, file$2, 33, 4, 1321);
    			if (!src_url_equal(img4.src, img4_src_value = PLATZI)) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Platzi event with my firends");
    			attr_dev(img4, "class", "svelte-eo8p7h");
    			add_location(img4, file$2, 37, 8, 1498);
    			attr_dev(figure4, "class", "svelte-eo8p7h");
    			add_location(figure4, file$2, 36, 4, 1445);
    			attr_dev(h12, "class", "svelte-eo8p7h");
    			add_location(h12, file$2, 40, 8, 1623);
    			if (!src_url_equal(img5.src, img5_src_value = MLSA)) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Platzi event with my firends");
    			attr_dev(img5, "class", "svelte-eo8p7h");
    			add_location(img5, file$2, 41, 8, 1647);
    			attr_dev(figure5, "class", "svelte-eo8p7h");
    			add_location(figure5, file$2, 39, 4, 1570);
    			attr_dev(h13, "class", "svelte-eo8p7h");
    			add_location(h13, file$2, 44, 8, 1768);
    			if (!src_url_equal(img6.src, img6_src_value = STEM)) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Platzi event with my firends");
    			attr_dev(img6, "class", "svelte-eo8p7h");
    			add_location(img6, file$2, 45, 8, 1790);
    			attr_dev(figure6, "class", "svelte-eo8p7h");
    			add_location(figure6, file$2, 43, 4, 1717);
    			if (!src_url_equal(img7.src, img7_src_value = FRIENDS)) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Platzi event with my firends");
    			attr_dev(img7, "class", "svelte-eo8p7h");
    			add_location(img7, file$2, 48, 8, 1913);
    			attr_dev(figure7, "class", "svelte-eo8p7h");
    			add_location(figure7, file$2, 47, 4, 1860);
    			if (!src_url_equal(img8.src, img8_src_value = ESCOM_3)) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "Platzi event with my firends");
    			attr_dev(img8, "class", "svelte-eo8p7h");
    			add_location(img8, file$2, 51, 8, 2037);
    			attr_dev(figure8, "class", "svelte-eo8p7h");
    			add_location(figure8, file$2, 50, 4, 1986);
    			attr_dev(h14, "class", "svelte-eo8p7h");
    			add_location(h14, file$2, 54, 8, 2161);
    			if (!src_url_equal(img9.src, img9_src_value = MLSA_1)) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "Platzi event with my firends");
    			attr_dev(img9, "class", "svelte-eo8p7h");
    			add_location(img9, file$2, 55, 8, 2189);
    			attr_dev(figure9, "class", "svelte-eo8p7h");
    			add_location(figure9, file$2, 53, 4, 2110);
    			if (!src_url_equal(img10.src, img10_src_value = ESCOM_4)) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "Platzi event with my firends");
    			attr_dev(img10, "class", "svelte-eo8p7h");
    			add_location(img10, file$2, 58, 8, 2314);
    			attr_dev(figure10, "class", "svelte-eo8p7h");
    			add_location(figure10, file$2, 57, 4, 2261);
    			if (!src_url_equal(img11.src, img11_src_value = MLSA_2)) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "Platzi event with my firends");
    			attr_dev(img11, "class", "svelte-eo8p7h");
    			add_location(img11, file$2, 61, 8, 2440);
    			attr_dev(figure11, "class", "svelte-eo8p7h");
    			add_location(figure11, file$2, 60, 4, 2387);
    			if (!src_url_equal(img12.src, img12_src_value = ESCOM_5)) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "Platzi event with my firends");
    			attr_dev(img12, "class", "svelte-eo8p7h");
    			add_location(img12, file$2, 64, 8, 2565);
    			attr_dev(figure12, "class", "svelte-eo8p7h");
    			add_location(figure12, file$2, 63, 4, 2512);
    			if (!src_url_equal(img13.src, img13_src_value = ESCOM_6)) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "Platzi event with my firends");
    			attr_dev(img13, "class", "svelte-eo8p7h");
    			add_location(img13, file$2, 67, 8, 2689);
    			attr_dev(figure13, "class", "svelte-eo8p7h");
    			add_location(figure13, file$2, 66, 4, 2638);
    			attr_dev(section, "class", "svelte-eo8p7h");
    			add_location(section, file$2, 21, 0, 885);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, figure0);
    			append_dev(figure0, img0);
    			append_dev(section, t0);
    			append_dev(section, figure1);
    			append_dev(figure1, h10);
    			append_dev(figure1, t2);
    			append_dev(figure1, img1);
    			append_dev(section, t3);
    			append_dev(section, figure2);
    			append_dev(figure2, h11);
    			append_dev(figure2, t5);
    			append_dev(figure2, img2);
    			append_dev(section, t6);
    			append_dev(section, figure3);
    			append_dev(figure3, img3);
    			append_dev(section, t7);
    			append_dev(section, figure4);
    			append_dev(figure4, img4);
    			append_dev(section, t8);
    			append_dev(section, figure5);
    			append_dev(figure5, h12);
    			append_dev(figure5, t10);
    			append_dev(figure5, img5);
    			append_dev(section, t11);
    			append_dev(section, figure6);
    			append_dev(figure6, h13);
    			append_dev(figure6, t13);
    			append_dev(figure6, img6);
    			append_dev(section, t14);
    			append_dev(section, figure7);
    			append_dev(figure7, img7);
    			append_dev(section, t15);
    			append_dev(section, figure8);
    			append_dev(figure8, img8);
    			append_dev(section, t16);
    			append_dev(section, figure9);
    			append_dev(figure9, h14);
    			append_dev(figure9, t18);
    			append_dev(figure9, img9);
    			append_dev(section, t19);
    			append_dev(section, figure10);
    			append_dev(figure10, img10);
    			append_dev(section, t20);
    			append_dev(section, figure11);
    			append_dev(figure11, img11);
    			append_dev(section, t21);
    			append_dev(section, figure12);
    			append_dev(figure12, img12);
    			append_dev(section, t22);
    			append_dev(section, figure13);
    			append_dev(figure13, img13);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(reveal.call(null, figure0, { transition: "slide" })),
    					action_destroyer(reveal.call(null, figure1, { transition: "fly" })),
    					action_destroyer(reveal.call(null, figure2, { transition: "slide" })),
    					action_destroyer(reveal.call(null, figure3, { transition: "fly" })),
    					action_destroyer(reveal.call(null, figure4, { transition: "slide" })),
    					action_destroyer(reveal.call(null, figure5, { transition: "slide" })),
    					action_destroyer(reveal.call(null, figure6, { transition: "fly" })),
    					action_destroyer(reveal.call(null, figure7, { transition: "slide" })),
    					action_destroyer(reveal.call(null, figure8, { transition: "fly" })),
    					action_destroyer(reveal.call(null, figure9, { transition: "fly" })),
    					action_destroyer(reveal.call(null, figure10, { transition: "slide" })),
    					action_destroyer(reveal.call(null, figure11, { transition: "slide" })),
    					action_destroyer(reveal.call(null, figure12, { transition: "slide" })),
    					action_destroyer(reveal.call(null, figure13, { transition: "fly" }))
    				];

    				mounted = true;
    			}
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Gallery', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Gallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ESCOM,
    		ESCOM_1,
    		ESCOM_2,
    		ESCOM_3,
    		ESCOM_4,
    		ESCOM_5,
    		ESCOM_6,
    		FRIENDS,
    		PLATZI_1,
    		PLATZI,
    		PLATZI_2,
    		MLSA,
    		MLSA_1,
    		MLSA_2,
    		STEM,
    		reveal
    	});

    	return [];
    }

    class Gallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gallery",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Main.svelte generated by Svelte v3.50.1 */
    const file$1 = "src/Main.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let profile;
    	let t0;
    	let about;
    	let t1;
    	let skillset;
    	let t2;
    	let projects;
    	let t3;
    	let gallery;
    	let t4;
    	let socialmedia;
    	let current;
    	profile = new Profile({ $$inline: true });
    	about = new About({ $$inline: true });
    	skillset = new Skillset({ $$inline: true });
    	projects = new Projects({ $$inline: true });
    	gallery = new Gallery({ $$inline: true });
    	socialmedia = new SocialMedia({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(profile.$$.fragment);
    			t0 = space();
    			create_component(about.$$.fragment);
    			t1 = space();
    			create_component(skillset.$$.fragment);
    			t2 = space();
    			create_component(projects.$$.fragment);
    			t3 = space();
    			create_component(gallery.$$.fragment);
    			t4 = space();
    			create_component(socialmedia.$$.fragment);
    			attr_dev(main, "class", "svelte-17ns00p");
    			add_location(main, file$1, 9, 0, 292);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(profile, main, null);
    			append_dev(main, t0);
    			mount_component(about, main, null);
    			append_dev(main, t1);
    			mount_component(skillset, main, null);
    			append_dev(main, t2);
    			mount_component(projects, main, null);
    			append_dev(main, t3);
    			mount_component(gallery, main, null);
    			append_dev(main, t4);
    			mount_component(socialmedia, main, null);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(profile.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(skillset.$$.fragment, local);
    			transition_in(projects.$$.fragment, local);
    			transition_in(gallery.$$.fragment, local);
    			transition_in(socialmedia.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(profile.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(skillset.$$.fragment, local);
    			transition_out(projects.$$.fragment, local);
    			transition_out(gallery.$$.fragment, local);
    			transition_out(socialmedia.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(profile);
    			destroy_component(about);
    			destroy_component(skillset);
    			destroy_component(projects);
    			destroy_component(gallery);
    			destroy_component(socialmedia);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Profile,
    		About,
    		Skillset,
    		Projects,
    		SocialMedia,
    		Gallery
    	});

    	return [];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Footer.svelte generated by Svelte v3.50.1 */

    const file = "src/Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let h4;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			h4 = element("h4");
    			t0 = text("Made with ");
    			img = element("img");
    			t1 = text(" by @darmasrmz");
    			if (!src_url_equal(img.src, img_src_value = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beating%20Heart.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Beating Heart");
    			attr_dev(img, "width", "40");
    			attr_dev(img, "height", "40");
    			add_location(img, file, 5, 18, 48);
    			attr_dev(h4, "class", "svelte-1g6xzpv");
    			add_location(h4, file, 5, 4, 34);
    			attr_dev(footer, "class", "svelte-1g6xzpv");
    			add_location(footer, file, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, h4);
    			append_dev(h4, t0);
    			append_dev(h4, img);
    			append_dev(h4, t1);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.50.1 */

    function create_fragment(ctx) {
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	main = new Main({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(main.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(main, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(main, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Main, Footer });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance, create_fragment, safe_not_equal$1, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
