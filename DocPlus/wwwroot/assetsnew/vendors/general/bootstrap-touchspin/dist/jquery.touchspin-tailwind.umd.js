"use strict";
var TouchSpinJQueryTailwind = (() => {
  // ../../core/dist/index.js
  var TouchSpinCallableEvent = /* @__PURE__ */ ((TouchSpinCallableEvent2) => {
    TouchSpinCallableEvent2["UPDATE_SETTINGS"] = "touchspin.updatesettings";
    TouchSpinCallableEvent2["UP_ONCE"] = "touchspin.uponce";
    TouchSpinCallableEvent2["DOWN_ONCE"] = "touchspin.downonce";
    TouchSpinCallableEvent2["START_UP_SPIN"] = "touchspin.startupspin";
    TouchSpinCallableEvent2["START_DOWN_SPIN"] = "touchspin.startdownspin";
    TouchSpinCallableEvent2["STOP_SPIN"] = "touchspin.stopspin";
    TouchSpinCallableEvent2["DESTROY"] = "touchspin.destroy";
    return TouchSpinCallableEvent2;
  })(TouchSpinCallableEvent || {});
  var DEFAULTS = {
    min: 0,
    max: 100,
    initval: "",
    replacementval: "",
    firstclickvalueifempty: null,
    step: 1,
    decimals: 0,
    forcestepdivisibility: "round",
    stepinterval: 100,
    stepintervaldelay: 500,
    verticalbuttons: false,
    verticalup: "+",
    verticaldown: "\u2212",
    verticalupclass: null,
    verticaldownclass: null,
    focusablebuttons: false,
    prefix: "",
    postfix: "",
    prefix_extraclass: "",
    postfix_extraclass: "",
    booster: true,
    boostat: 10,
    maxboostedstep: false,
    mousewheel: true,
    buttonup_class: null,
    buttondown_class: null,
    buttonup_txt: "+",
    buttondown_txt: "&minus;",
    callback_before_calculation: (v) => v,
    callback_after_calculation: (v) => v,
    renderer: null
  };
  var INSTANCE_KEY = "_touchSpinCore";
  var TouchSpinCore = class _TouchSpinCore {
    /**
     * @param inputEl The input element
     * @param opts Partial settings
     */
    constructor(inputEl, opts = {}) {
      this._teardownCallbacks = [];
      this._settingObservers = /* @__PURE__ */ new Map();
      this._spinDelayTimeout = null;
      this._spinIntervalTimer = null;
      this._upButton = null;
      this._originalAttributes = null;
      this._downButton = null;
      this._mutationObserver = null;
      this._wrapper = null;
      if (!inputEl || inputEl.nodeName !== "INPUT") {
        throw new Error("TouchSpinCore requires an <input> element");
      }
      this.input = inputEl;
      const dataAttrs = this._parseDataAttributes(inputEl);
      const globalDefaults = typeof globalThis !== "undefined" && globalThis.TouchSpinDefaultOptions ? _TouchSpinCore.sanitizePartialSettings(
        globalThis.TouchSpinDefaultOptions,
        DEFAULTS
      ) : {};
      this.settings = Object.assign({}, DEFAULTS, globalDefaults, dataAttrs, opts);
      this._sanitizeSettings();
      this._currentStepSize = this.settings.step || 1;
      if (!this.settings.renderer) {
        const g = globalThis;
        if (g == null ? void 0 : g.TouchSpinDefaultRenderer) {
          this.settings.renderer = g.TouchSpinDefaultRenderer;
        } else {
          console.warn(
            "TouchSpin: No renderer specified (renderer: null). Only keyboard/wheel events will work. Consider using Bootstrap3/4/5Renderer or TailwindRenderer for UI."
          );
        }
      }
      this.spinning = false;
      this.spincount = 0;
      this.direction = false;
      this._teardownCallbacks = [];
      this._settingObservers = /* @__PURE__ */ new Map();
      this._spinDelayTimeout = null;
      this._spinIntervalTimer = null;
      this._upButton = null;
      this._downButton = null;
      this._wrapper = null;
      this._handleUpMouseDown = this._handleUpMouseDown.bind(this);
      this._handleDownMouseDown = this._handleDownMouseDown.bind(this);
      this._handleMouseUp = this._handleMouseUp.bind(this);
      this._handleUpKeyDown = this._handleUpKeyDown.bind(this);
      this._handleUpKeyUp = this._handleUpKeyUp.bind(this);
      this._handleDownKeyDown = this._handleDownKeyDown.bind(this);
      this._handleDownKeyUp = this._handleDownKeyUp.bind(this);
      this._handleWindowChangeCapture = this._handleWindowChangeCapture.bind(this);
      this._handleKeyDown = this._handleKeyDown.bind(this);
      this._handleKeyUp = this._handleKeyUp.bind(this);
      this._handleWheel = this._handleWheel.bind(this);
      this._initializeInput();
      if (this.settings.renderer) {
        const Ctor = this.settings.renderer;
        this.renderer = new Ctor(
          inputEl,
          this.settings,
          this
        );
        this.renderer.init();
      }
      this._setupMutationObserver();
      if (this.renderer) {
        this.renderer.finalizeWrapperAttributes();
      }
      this.input.setAttribute("data-touchspin-injected", "input");
    }
    /**
     * Sanitize a partial settings object BEFORE applying it.
     * Returns a new object with only provided keys normalized.
     * @param {Partial<TouchSpinCoreOptions>} partial
     * @param {TouchSpinCoreOptions} current
     * @returns {Partial<TouchSpinCoreOptions>}
     */
    static sanitizePartialSettings(partial, _current) {
      const out = { ...partial };
      if (Object.hasOwn(partial, "step")) {
        const n = Number(partial.step);
        out.step = Number.isFinite(n) && n > 0 ? n : 1;
      }
      if (Object.hasOwn(partial, "decimals")) {
        const n = Number(partial.decimals);
        out.decimals = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
      }
      const hasMin = Object.hasOwn(partial, "min");
      const hasMax = Object.hasOwn(partial, "max");
      if (hasMin) {
        if (partial.min === null || partial.min === void 0 || typeof partial.min === "string" && partial.min === "") {
          out.min = null;
        } else {
          const n = Number(partial.min);
          out.min = Number.isFinite(n) ? n : null;
        }
      }
      if (hasMax) {
        if (partial.max === null || partial.max === void 0 || typeof partial.max === "string" && partial.max === "") {
          out.max = null;
        } else {
          const n = Number(partial.max);
          out.max = Number.isFinite(n) ? n : null;
        }
      }
      if (hasMin && hasMax && out.min != null && out.max != null && typeof out.min === "number" && typeof out.max === "number" && out.min > out.max) {
        const tmp = out.min;
        out.min = out.max;
        out.max = tmp;
      }
      if (Object.hasOwn(partial, "stepinterval")) {
        const n = Number(partial.stepinterval);
        out.stepinterval = Number.isFinite(n) && n >= 0 ? n : DEFAULTS.stepinterval;
      }
      if (Object.hasOwn(partial, "stepintervaldelay")) {
        const n = Number(partial.stepintervaldelay);
        out.stepintervaldelay = Number.isFinite(n) && n >= 0 ? n : DEFAULTS.stepintervaldelay;
      }
      return out;
    }
    /**
     * Initialize input element (core always handles this)
     * @private
     */
    _initializeInput() {
      var _a;
      this._captureOriginalAttributes();
      const initVal = (_a = this.settings.initval) != null ? _a : "";
      if (initVal !== "" && this.input.value === "") {
        this.input.value = String(initVal);
      }
      this._updateAriaAttributes();
      this._syncNativeAttributes();
      this._checkValue(false);
    }
    /**
     * Normalize and validate settings: coerce invalid values to safe defaults.
     * - step: > 0 number, otherwise 1
     * - decimals: integer >= 0, otherwise 0
     * - min/max: finite numbers or null
     * - stepinterval/stepintervaldelay: integers >= 0 (fallback to defaults if invalid)
     * @private
     */
    _sanitizeSettings() {
      const stepNum = Number(this.settings.step);
      if (!Number.isFinite(stepNum) || stepNum <= 0) {
        this.settings.step = 1;
      } else {
        this.settings.step = stepNum;
      }
      const decNum = Number(this.settings.decimals);
      if (!Number.isFinite(decNum) || decNum < 0) {
        this.settings.decimals = 0;
      } else {
        this.settings.decimals = Math.floor(decNum);
      }
      if (this.settings.min === null || this.settings.min === void 0 || typeof this.settings.min === "string" && this.settings.min === "") {
        this.settings.min = null;
      } else {
        const minNum = Number(this.settings.min);
        this.settings.min = Number.isFinite(minNum) ? minNum : null;
      }
      if (this.settings.max === null || this.settings.max === void 0 || typeof this.settings.max === "string" && this.settings.max === "") {
        this.settings.max = null;
      } else {
        const maxNum = Number(this.settings.max);
        this.settings.max = Number.isFinite(maxNum) ? maxNum : null;
      }
      if (this.settings.min !== null && this.settings.max !== null && this.settings.min > this.settings.max) {
        const tmp = this.settings.min;
        this.settings.min = this.settings.max;
        this.settings.max = tmp;
      }
      const si = Number(this.settings.stepinterval);
      if (!Number.isFinite(si) || si < 0) this.settings.stepinterval = DEFAULTS.stepinterval;
      const sid = Number(this.settings.stepintervaldelay);
      if (!Number.isFinite(sid) || sid < 0)
        this.settings.stepintervaldelay = DEFAULTS.stepintervaldelay;
      this._validateCallbacks();
      this._checkCallbackPairing();
    }
    /**
     * Validate callbacks and automatically convert number inputs to text inputs
     * when formatting callbacks that add non-numeric characters are detected.
     * @private
     */
    _validateCallbacks() {
      var _a, _b, _c;
      const currentType = this.input.getAttribute("type");
      if (currentType !== "number") return;
      const defaultCallback = (v) => v;
      if (!this.settings.callback_after_calculation || this.settings.callback_after_calculation.toString() === defaultCallback.toString())
        return;
      const testValue = "123.45";
      const afterResult = this.settings.callback_after_calculation(testValue);
      if (!/^-?\d*\.?\d*$/.test(afterResult)) {
        console.warn(
          'TouchSpin: Detected formatting callback that adds non-numeric characters. Converting input from type="number" to type="text" to support formatting like "' + afterResult + '". This ensures compatibility with custom formatting while maintaining full TouchSpin functionality. The original type will be restored when TouchSpin is destroyed.'
        );
        this._captureOriginalAttributes();
        this.input.setAttribute("type", "text");
        const step = (_a = this.settings.step) != null ? _a : 1;
        const decimalsSetting = (_b = this.settings.decimals) != null ? _b : 0;
        const hasDecimals = decimalsSetting > 0 || step % 1 !== 0;
        const minSetting = (_c = this.settings.min) != null ? _c : null;
        const allowNegative = minSetting === null || typeof minSetting === "number" && minSetting < 0;
        if (!this.input.hasAttribute("inputmode")) {
          const inputMode = hasDecimals || allowNegative ? "decimal" : "numeric";
          this.input.setAttribute("inputmode", inputMode);
        }
        ["min", "max", "step"].forEach((attr) => {
          var _a2, _b2;
          const originalValue = (_b2 = (_a2 = this._originalAttributes) == null ? void 0 : _a2.attributes.get(attr)) != null ? _b2 : null;
          if (originalValue === null) {
            this.input.removeAttribute(attr);
          }
        });
      }
    }
    /**
     * Capture the original attributes of the input before TouchSpin modifies them.
     * This ensures complete transparency - the input can be restored to its exact original state.
     * @private
     */
    _captureOriginalAttributes() {
      if (this._originalAttributes !== null) return;
      const attributesToTrack = [
        "role",
        "aria-valuemin",
        "aria-valuemax",
        "aria-valuenow",
        "aria-valuetext",
        "min",
        "max",
        "step",
        "inputmode"
      ];
      this._originalAttributes = {
        type: this.input.getAttribute("type"),
        attributes: /* @__PURE__ */ new Map()
      };
      attributesToTrack.forEach((attr) => {
        var _a;
        (_a = this._originalAttributes) == null ? void 0 : _a.attributes.set(attr, this.input.getAttribute(attr));
      });
    }
    /**
     * Restore the input to its original state by restoring all original attributes.
     * This ensures complete transparency - the input returns to its exact original state.
     * @private
     */
    _restoreOriginalAttributes() {
      if (this._originalAttributes === null) return;
      const currentValue = this.input.value;
      if (currentValue && this.settings.callback_before_calculation) {
        const rawValue = this.settings.callback_before_calculation(currentValue);
        this.input.value = rawValue;
      }
      if (this._originalAttributes.type) {
        this.input.setAttribute("type", this._originalAttributes.type);
      }
      this._originalAttributes.attributes.forEach((originalValue, attrName) => {
        if (originalValue === null) {
          this.input.removeAttribute(attrName);
        } else {
          this.input.setAttribute(attrName, originalValue);
        }
      });
      this._originalAttributes = null;
    }
    /**
     * Parse data-bts-* attributes from the input element.
     * @param {HTMLInputElement} inputEl
     * @returns {Partial<TouchSpinCoreOptions>}
     * @private
     */
    _parseDataAttributes(inputEl) {
      const attributeMap = {
        min: "min",
        max: "max",
        initval: "init-val",
        replacementval: "replacement-val",
        firstclickvalueifempty: "first-click-value-if-empty",
        step: "step",
        decimals: "decimals",
        stepinterval: "step-interval",
        verticalbuttons: "vertical-buttons",
        verticalup: "vertical-up",
        verticaldown: "vertical-down",
        verticalupclass: "vertical-up-class",
        verticaldownclass: "vertical-down-class",
        forcestepdivisibility: "force-step-divisibility",
        stepintervaldelay: "step-interval-delay",
        prefix: "prefix",
        postfix: "postfix",
        prefix_extraclass: "prefix-extra-class",
        postfix_extraclass: "postfix-extra-class",
        booster: "booster",
        boostat: "boostat",
        maxboostedstep: "max-boosted-step",
        mousewheel: "mouse-wheel",
        buttondown_class: "button-down-class",
        buttonup_class: "button-up-class",
        buttondown_txt: "button-down-txt",
        buttonup_txt: "button-up-txt"
      };
      const parsed = {};
      for (const [optionName, attrName] of Object.entries(attributeMap)) {
        const fullAttrName = `data-bts-${attrName}`;
        if (inputEl.hasAttribute(fullAttrName)) {
          const rawValue = inputEl.getAttribute(fullAttrName);
          parsed[optionName] = this._coerceAttributeValue(optionName, rawValue != null ? rawValue : "");
        }
      }
      for (const nativeAttr of ["min", "max", "step"]) {
        if (inputEl.hasAttribute(nativeAttr)) {
          const rawValue = inputEl.getAttribute(nativeAttr);
          if (parsed[nativeAttr] !== void 0) {
            console.warn(
              `Both "data-bts-${nativeAttr}" and "${nativeAttr}" attributes specified. Native attribute takes precedence.`,
              inputEl
            );
          }
          parsed[nativeAttr] = this._coerceAttributeValue(
            nativeAttr,
            rawValue != null ? rawValue : ""
          );
        }
      }
      return parsed;
    }
    /**
     * Convert string attribute values to appropriate types.
     * @param {string} optionName
     * @param {string} rawValue
     * @returns {any}
     * @private
     */
    _coerceAttributeValue(optionName, rawValue) {
      if (rawValue === null || rawValue === void 0) {
        return rawValue;
      }
      if (["booster", "mousewheel", "verticalbuttons", "focusablebuttons"].includes(optionName)) {
        return rawValue === "true" || rawValue === "" || rawValue === optionName;
      }
      if ([
        "min",
        "max",
        "step",
        "decimals",
        "stepinterval",
        "stepintervaldelay",
        "boostat",
        "maxboostedstep",
        "firstclickvalueifempty"
      ].includes(optionName)) {
        const num = parseFloat(rawValue);
        return Number.isNaN(num) ? rawValue : num;
      }
      return rawValue;
    }
    /** Increment once according to step */
    upOnce() {
      if (this.input.disabled || this.input.hasAttribute("readonly")) {
        return;
      }
      const v = this.getValue();
      const next = this._nextValue("up", v);
      if (this.settings.max !== null && v === this.settings.max) {
        this.emit("max");
        if (this.spinning && this.direction === "up") {
          this.stopSpin();
        }
        return;
      }
      if (this.settings.max !== null && next === this.settings.max) {
        this.emit("max");
        if (this.spinning && this.direction === "up") {
          this.stopSpin();
        }
      }
      this._setDisplay(next, true);
    }
    /** Decrement once according to step */
    downOnce() {
      if (this.input.disabled || this.input.hasAttribute("readonly")) {
        return;
      }
      const v = this.getValue();
      const next = this._nextValue("down", v);
      if (this.settings.min !== null && v === this.settings.min) {
        this.emit("min");
        if (this.spinning && this.direction === "down") {
          this.stopSpin();
        }
        return;
      }
      if (this.settings.min !== null && next === this.settings.min) {
        this.emit("min");
        if (this.spinning && this.direction === "down") {
          this.stopSpin();
        }
      }
      this._setDisplay(next, true);
    }
    /** Start increasing repeatedly; no immediate step here. */
    startUpSpin() {
      const currentValue = this.getValue();
      if (this.settings.max !== null && currentValue === this.settings.max) {
        this.emit("max");
        return;
      }
      this._startSpin("up");
    }
    /** Start decreasing repeatedly; no immediate step here. */
    startDownSpin() {
      const currentValue = this.getValue();
      if (this.settings.min !== null && currentValue === this.settings.min) {
        this.emit("min");
        return;
      }
      this._startSpin("down");
    }
    /** Stop spinning (placeholder) */
    stopSpin() {
      this._clearSpinTimers();
      if (this.spinning) {
        if (this.direction === "up") {
          this.emit("stopupspin");
          this.emit("stopspin");
        } else if (this.direction === "down") {
          this.emit("stopdownspin");
          this.emit("stopspin");
        }
      }
      this.spinning = false;
      this.direction = false;
      this.spincount = 0;
      this._currentStepSize = this.settings.step || 1;
    }
    updateSettings(opts) {
      const oldSettings = { ...this.settings };
      const newSettings = opts || {};
      const sanitizedPartial = _TouchSpinCore.sanitizePartialSettings(newSettings, oldSettings);
      Object.assign(this.settings, sanitizedPartial);
      this._sanitizeSettings();
      const step = Number(this.settings.step || 1);
      if ((sanitizedPartial.step !== void 0 || sanitizedPartial.min !== void 0 || sanitizedPartial.max !== void 0) && step !== 1) {
        if (this.settings.max !== null) {
          this.settings.max = this._alignToStep(Number(this.settings.max), step, "down");
        }
        if (this.settings.min !== null) {
          this.settings.min = this._alignToStep(Number(this.settings.min), step, "up");
        }
      }
      Object.keys(this.settings).forEach((key) => {
        if (oldSettings[key] !== this.settings[key]) {
          const observers = this._settingObservers.get(String(key));
          if (observers) {
            observers.forEach((callback) => {
              try {
                callback(this.settings[key], oldSettings[key]);
              } catch (error) {
                console.error("TouchSpin: Error in setting observer callback:", error);
              }
            });
          }
        }
      });
      this._updateAriaAttributes();
      this._syncNativeAttributes();
      this._checkValue(true);
      this._currentStepSize = this.settings.step || 1;
      this._checkCallbackPairing();
    }
    getValue() {
      var _a;
      let raw = this.input.value;
      const repl = (_a = this.settings.replacementval) != null ? _a : "";
      if (raw === "" && repl !== "") {
        raw = String(repl);
      }
      if (raw === "") return NaN;
      const before = this.settings.callback_before_calculation || ((v) => v);
      const num = parseFloat(before(String(raw)));
      return Number.isNaN(num) ? NaN : num;
    }
    setValue(v) {
      if (this.input.disabled || this.input.hasAttribute("readonly")) return;
      const parsed = Number(v);
      if (!Number.isFinite(parsed)) return;
      const adjusted = this._applyConstraints(parsed);
      const wasSanitized = parsed !== adjusted;
      this._setDisplay(adjusted, true, wasSanitized, false);
    }
    /**
     * Initialize DOM event handling by finding elements and attaching listeners.
     * Must be called after the renderer has created the DOM structure.
     */
    initDOMEventHandling() {
      this._findDOMElements();
      this._attachDOMEventListeners();
    }
    /**
     * Register a teardown callback that will be called when the instance is destroyed.
     * This allows wrapper libraries to register cleanup logic.
     * @param {Function} callback - Function to call on destroy
     * @returns {Function} - Unregister function
     */
    registerTeardown(callback) {
      if (typeof callback !== "function") {
        throw new Error("Teardown callback must be a function");
      }
      this._teardownCallbacks.push(callback);
      return () => {
        const index = this._teardownCallbacks.indexOf(callback);
        if (index > -1) {
          this._teardownCallbacks.splice(index, 1);
        }
      };
    }
    /** Cleanup and destroy the TouchSpin instance */
    destroy() {
      var _a;
      this.input.removeAttribute("data-touchspin-injected");
      this.stopSpin();
      if ((_a = this.renderer) == null ? void 0 : _a.teardown) {
        this.renderer.teardown();
      }
      this._detachDOMEventListeners();
      this._teardownCallbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error("TouchSpin teardown callback error:", error);
        }
      });
      this._teardownCallbacks.length = 0;
      this._settingObservers.clear();
      if (this._mutationObserver) {
        this._mutationObserver.disconnect();
        this._mutationObserver = null;
      }
      this._upButton = null;
      this._downButton = null;
      this._restoreOriginalAttributes();
      const inst = this.input[INSTANCE_KEY];
      if (inst && inst === this) {
        delete this.input[INSTANCE_KEY];
      }
    }
    /**
     * Create a plain public API object with bound methods for wrappers.
     * @returns {TouchSpinCorePublicAPI}
     */
    toPublicApi() {
      return {
        upOnce: this.upOnce.bind(this),
        downOnce: this.downOnce.bind(this),
        startUpSpin: this.startUpSpin.bind(this),
        startDownSpin: this.startDownSpin.bind(this),
        stopSpin: this.stopSpin.bind(this),
        updateSettings: this.updateSettings.bind(this),
        getValue: this.getValue.bind(this),
        setValue: this.setValue.bind(this),
        destroy: this.destroy.bind(this),
        initDOMEventHandling: this.initDOMEventHandling.bind(this),
        registerTeardown: this.registerTeardown.bind(this),
        attachUpEvents: this.attachUpEvents.bind(this),
        attachDownEvents: this.attachDownEvents.bind(this),
        observeSetting: this.observeSetting.bind(this)
      };
    }
    // --- Renderer Event Attachment Methods ---
    /**
     * Attach up button events to an element
     * Called by renderers after creating up button
     * @param {HTMLElement|null} element - The element to attach events to
     */
    attachUpEvents(element) {
      if (!element) {
        console.warn("TouchSpin: attachUpEvents called with null element");
        return;
      }
      this._upButton = element;
      element.addEventListener("mousedown", this._handleUpMouseDown);
      element.addEventListener("touchstart", this._handleUpMouseDown, { passive: false });
      if (this.settings.focusablebuttons) {
        element.addEventListener("keydown", this._handleUpKeyDown);
        element.addEventListener("keyup", this._handleUpKeyUp);
      }
      this._updateButtonDisabledState();
    }
    /**
     * Attach down button events to an element
     * Called by renderers after creating down button
     * @param {HTMLElement|null} element - The element to attach events to
     */
    attachDownEvents(element) {
      if (!element) {
        console.warn("TouchSpin: attachDownEvents called with null element");
        return;
      }
      this._downButton = element;
      element.addEventListener("mousedown", this._handleDownMouseDown);
      element.addEventListener("touchstart", this._handleDownMouseDown, { passive: false });
      if (this.settings.focusablebuttons) {
        element.addEventListener("keydown", this._handleDownKeyDown);
        element.addEventListener("keyup", this._handleDownKeyUp);
      }
      this._updateButtonDisabledState();
    }
    // --- Settings Observer Pattern ---
    /**
     * Allow renderers to observe setting changes
     * @param {string} settingName - Name of setting to observe
     * @param {Function} callback - Function to call when setting changes (newValue, oldValue)
     * @returns {Function} Unsubscribe function
     */
    observeSetting(settingName, callback) {
      const key = String(settingName);
      if (!this._settingObservers.has(key)) {
        this._settingObservers.set(key, /* @__PURE__ */ new Set());
      }
      const observers = this._settingObservers.get(key);
      observers.add(callback);
      return () => observers.delete(callback);
    }
    // --- Minimal internal emitter API ---
    /**
     * Emit a core event as DOM CustomEvent (matching original jQuery plugin behavior)
     * @param event - Event name
     * @param detail - Event detail data (can be modified for speedchange events)
     * @param cancelable - Whether the event can be canceled (default: false)
     * @returns Whether the event was prevented (only meaningful for cancelable events)
     *
     * Cancelable events include:
     * - 'startupspin': emitted before starting upward spinning, can be prevented
     * - 'startdownspin': emitted before starting downward spinning, can be prevented
     * - 'speedchange': emitted before step size increases, can be prevented or modified
     */
    emit(event, detail, cancelable = false) {
      const domEventName = `touchspin.on.${event}`;
      const customEvent = new CustomEvent(domEventName, {
        detail,
        bubbles: true,
        cancelable
      });
      const wasPrevented = !this.input.dispatchEvent(customEvent);
      return wasPrevented;
    }
    /**
     * Internal: start timed spin in a direction with initial step, delay, then interval.
     * @param {'up'|'down'} dir
     */
    _startSpin(dir) {
      if (this.input.disabled || this.input.hasAttribute("readonly")) return;
      if (this.spinning && this.direction === dir) {
        return;
      }
      if (this.spinning && this.direction !== dir) {
        this.stopSpin();
      }
      const direction_changed = !this.spinning || this.direction !== dir;
      if (direction_changed) {
        this.spinning = true;
        this.direction = dir;
        this.spincount = 0;
        this._currentStepSize = this.settings.step || 1;
        this.emit("startspin");
        if (dir === "up") {
          if (this.emit("startupspin", void 0, true)) {
            this.spinning = false;
            this.direction = false;
            return;
          }
        } else {
          if (this.emit("startdownspin", void 0, true)) {
            this.spinning = false;
            this.direction = false;
            return;
          }
        }
      }
      if (dir === "up") this.upOnce();
      else this.downOnce();
      const v = this.getValue();
      if (dir === "up" && this.settings.max !== null && v === this.settings.max) {
        return;
      }
      if (dir === "down" && this.settings.min !== null && v === this.settings.min) {
        return;
      }
      this._clearSpinTimers();
      const delay = this.settings.stepintervaldelay || 500;
      const interval = this.settings.stepinterval || 100;
      this._spinDelayTimeout = setTimeout(() => {
        this._spinDelayTimeout = null;
        this._spinIntervalTimer = setInterval(() => {
          if (!this.spinning || this.direction !== dir) return;
          this._spinStep(dir);
        }, interval);
      }, delay);
    }
    _clearSpinTimers() {
      try {
        if (this._spinDelayTimeout) {
          clearTimeout(this._spinDelayTimeout);
        }
      } catch (e) {
      }
      try {
        if (this._spinIntervalTimer) {
          clearInterval(this._spinIntervalTimer);
        }
      } catch (e) {
      }
      this._spinDelayTimeout = null;
      this._spinIntervalTimer = null;
    }
    /**
     * Compute the next numeric value for a direction, respecting step, booster and bounds.
     * @param {'up'|'down'} dir
     * @param {number} current
     */
    _nextValue(dir, current) {
      var _a;
      let v = current;
      if (Number.isNaN(v)) {
        v = this._valueIfIsNaN();
      } else {
        const base = this.settings.step || 1;
        const mbs = this.settings.maxboostedstep;
        let stepCandidate = base;
        if (this.settings.booster) {
          const boostat = Math.max(1, parseInt(String(this.settings.boostat || 10), 10));
          stepCandidate = 2 ** Math.floor(this.spincount / boostat) * base;
        }
        let step = stepCandidate;
        if (mbs && Number.isFinite(mbs) && stepCandidate > Number(mbs)) {
          step = Number(mbs);
          v = Math.round(v / step) * step;
        }
        step = Math.max(base, step);
        const currentSize = (_a = this._currentStepSize) != null ? _a : base;
        if (step < currentSize) {
          step = currentSize;
        }
        if (step > this._currentStepSize) {
          const currentLevel = Math.floor(Math.log2(this._currentStepSize / base));
          const newLevel = Math.floor(Math.log2(step / base));
          const eventData = {
            currentLevel,
            newLevel,
            currentStep: this._currentStepSize,
            newStep: step,
            direction: dir
          };
          if (this.emit("speedchange", eventData, true)) {
            step = this._currentStepSize;
          } else {
            const modifiedStep = Number(eventData.newStep);
            if (Number.isFinite(modifiedStep) && modifiedStep >= this.settings.step) {
              step = Math.min(modifiedStep, this.settings.maxboostedstep || Number.MAX_SAFE_INTEGER);
            } else {
              step = this._currentStepSize;
            }
          }
        }
        this._currentStepSize = step;
        v = dir === "up" ? v + step : v - step;
      }
      return this._applyConstraints(v);
    }
    /** Returns a reasonable value to use when current is NaN. */
    _valueIfIsNaN() {
      if (typeof this.settings.firstclickvalueifempty === "number") {
        return this.settings.firstclickvalueifempty;
      }
      const min = typeof this.settings.min === "number" ? this.settings.min : 0;
      const max = typeof this.settings.max === "number" ? this.settings.max : min;
      return (min + max) / 2;
    }
    /** Apply step divisibility and clamp to min/max. */
    _applyConstraints(v) {
      var _a, _b;
      const aligned = this._forcestepdivisibility(v);
      const min = (_a = this.settings.min) != null ? _a : null;
      const max = (_b = this.settings.max) != null ? _b : null;
      let clamped = aligned;
      if (typeof min === "number" && clamped < min) clamped = min;
      if (typeof max === "number" && clamped > max) clamped = max;
      return clamped;
    }
    /** Determine the effective step with booster if enabled. */
    _getBoostedStep() {
      const base = this.settings.step || 1;
      if (!this.settings.booster) return base;
      const boostat = Math.max(1, parseInt(String(this.settings.boostat || 10), 10));
      let boosted = 2 ** Math.floor(this.spincount / boostat) * base;
      const mbs = this.settings.maxboostedstep;
      if (mbs && Number.isFinite(mbs)) {
        const cap = Number(mbs);
        if (boosted > cap) boosted = cap;
      }
      return Math.max(base, boosted);
    }
    /** Aligns value to step per forcestepdivisibility. */
    _forcestepdivisibility(val) {
      const mode = this.settings.forcestepdivisibility || "round";
      const step = this.settings.step || 1;
      const dec = this.settings.decimals || 0;
      let out;
      switch (mode) {
        case "floor":
          out = Math.floor(val / step) * step;
          break;
        case "ceil":
          out = Math.ceil(val / step) * step;
          break;
        case "none":
          out = val;
          break;
        default:
          out = Math.round(val / step) * step;
          break;
      }
      const result = Number(out.toFixed(dec));
      return result;
    }
    /** Aligns a value to nearest step boundary using integer arithmetic. */
    _alignToStep(val, step, dir) {
      if (step === 0) return val;
      let k = 1;
      const s = step;
      while (s * k % 1 !== 0 && k < 1e6) k *= 10;
      const V = Math.round(val * k);
      const S = Math.round(step * k);
      const r = V % S;
      if (r === 0) return val;
      return (dir === "down" ? V - r : V + (S - r)) / k;
    }
    /** Format and write to input, optionally emit change if different. */
    _setDisplay(num, mayTriggerChange, forceTrigger = false, onlyTriggerIfSanitized = false) {
      var _a;
      const prev = String((_a = this.input.value) != null ? _a : "");
      const next = this._formatDisplay(num);
      this.input.value = next;
      this._updateAriaAttributes();
      if (mayTriggerChange && (onlyTriggerIfSanitized ? forceTrigger : forceTrigger || prev !== next)) {
        this.input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return next;
    }
    _formatDisplay(num) {
      const dec = this.settings.decimals || 0;
      const after = this.settings.callback_after_calculation || ((v) => v);
      const s = Number(num).toFixed(dec);
      return after(s);
    }
    /**
     * Perform one spin step in a direction while tracking spincount for booster.
     * @param {'up'|'down'} dir
     */
    _spinStep(dir) {
      this.spincount++;
      if (dir === "up") this.upOnce();
      else this.downOnce();
    }
    /** Sanitize current input value and update display; optionally emits change. */
    _checkValue(mayTriggerChange) {
      const v = this.getValue();
      if (!Number.isFinite(v)) return;
      const adjusted = this._applyConstraints(v);
      const wasSanitized = v !== adjusted;
      this._setDisplay(adjusted, !!mayTriggerChange, wasSanitized);
    }
    _updateAriaAttributes() {
      var _a, _b;
      const el = this.input;
      if (el.getAttribute("role") !== "spinbutton") {
        el.setAttribute("role", "spinbutton");
      }
      const min = (_a = this.settings.min) != null ? _a : null;
      const max = (_b = this.settings.max) != null ? _b : null;
      if (typeof min === "number") el.setAttribute("aria-valuemin", String(min));
      else el.removeAttribute("aria-valuemin");
      if (typeof max === "number") el.setAttribute("aria-valuemax", String(max));
      else el.removeAttribute("aria-valuemax");
      const raw = el.value;
      const before = this.settings.callback_before_calculation || ((v) => v);
      const num = parseFloat(before(String(raw)));
      if (Number.isFinite(num)) el.setAttribute("aria-valuenow", String(num));
      else el.removeAttribute("aria-valuenow");
      el.setAttribute("aria-valuetext", String(raw));
    }
    /**
     * Synchronize TouchSpin settings to native input attributes.
     * Only applies to type="number" inputs to maintain browser consistency.
     * @private
     */
    _syncNativeAttributes() {
      var _a, _b;
      if (this.input.getAttribute("type") === "number") {
        const min = (_a = this.settings.min) != null ? _a : null;
        if (typeof min === "number" && Number.isFinite(min)) {
          this.input.setAttribute("min", String(min));
        } else {
          this.input.removeAttribute("min");
        }
        const max = (_b = this.settings.max) != null ? _b : null;
        if (typeof max === "number" && Number.isFinite(max)) {
          this.input.setAttribute("max", String(max));
        } else {
          this.input.removeAttribute("max");
        }
        const step = this.settings.step;
        if (typeof step === "number" && Number.isFinite(step) && step > 0) {
          this.input.setAttribute("step", String(step));
        } else {
          this.input.removeAttribute("step");
        }
      }
    }
    /**
     * Update TouchSpin settings from native attribute changes.
     * Called by mutation observer when min/max/step attributes change.
     * @private
     */
    _syncSettingsFromNativeAttributes() {
      const nativeMin = this.input.getAttribute("min");
      const nativeMax = this.input.getAttribute("max");
      const nativeStep = this.input.getAttribute("step");
      let needsUpdate = false;
      const newSettings = {};
      if (nativeMin !== null) {
        const parsedMin = nativeMin === "" ? null : parseFloat(nativeMin);
        const minNum = parsedMin !== null && Number.isFinite(parsedMin) ? parsedMin : null;
        if (minNum !== this.settings.min) {
          newSettings.min = minNum;
          needsUpdate = true;
        }
      } else if (this.settings.min !== null) {
        newSettings.min = null;
        needsUpdate = true;
      }
      if (nativeMax !== null) {
        const parsedMax = nativeMax === "" ? null : parseFloat(nativeMax);
        const maxNum = parsedMax !== null && Number.isFinite(parsedMax) ? parsedMax : null;
        if (maxNum !== this.settings.max) {
          newSettings.max = maxNum;
          needsUpdate = true;
        }
      } else if (this.settings.max !== null) {
        newSettings.max = null;
        needsUpdate = true;
      }
      if (nativeStep !== null) {
        const parsedStep = nativeStep === "" ? void 0 : parseFloat(nativeStep);
        const stepNum = parsedStep !== void 0 && Number.isFinite(parsedStep) && parsedStep > 0 ? parsedStep : void 0;
        if (stepNum !== this.settings.step) {
          newSettings.step = stepNum != null ? stepNum : 1;
          needsUpdate = true;
        }
      } else if (this.settings.step !== 1) {
        newSettings.step = 1;
        needsUpdate = true;
      }
      if (needsUpdate) {
        this.updateSettings(newSettings);
      }
    }
    // --- DOM Event Handling Methods ---
    /**
     * Find and store references to DOM elements using data-touchspin-injected attributes.
     * @private
     */
    _findDOMElements() {
      let wrapper = this.input.parentElement;
      while (wrapper && !wrapper.hasAttribute("data-touchspin-injected")) {
        wrapper = wrapper.parentElement;
      }
      this._wrapper = wrapper;
    }
    /**
     * Attach DOM event listeners to elements.
     * @private
     */
    _attachDOMEventListeners() {
      document.addEventListener("mouseup", this._handleMouseUp);
      document.addEventListener("mouseleave", this._handleMouseUp);
      document.addEventListener("touchend", this._handleMouseUp);
      window.addEventListener("change", this._handleWindowChangeCapture, true);
      this.input.addEventListener("keydown", this._handleKeyDown);
      this.input.addEventListener("keyup", this._handleKeyUp);
      this.input.addEventListener("wheel", this._handleWheel);
    }
    /**
     * Remove DOM event listeners.
     * @private
     */
    _detachDOMEventListeners() {
      document.removeEventListener("mouseup", this._handleMouseUp);
      document.removeEventListener("mouseleave", this._handleMouseUp);
      document.removeEventListener("touchend", this._handleMouseUp);
      window.removeEventListener("change", this._handleWindowChangeCapture, true);
      this.input.removeEventListener("keydown", this._handleKeyDown);
      this.input.removeEventListener("keyup", this._handleKeyUp);
      this.input.removeEventListener("wheel", this._handleWheel);
    }
    // --- DOM Event Handlers ---
    /**
     * Handle mousedown/touchstart on up button.
     * @private
     */
    _handleUpMouseDown(e) {
      e.preventDefault();
      this.startUpSpin();
    }
    /**
     * Handle mousedown/touchstart on down button.
     * @private
     */
    _handleDownMouseDown(e) {
      e.preventDefault();
      this.startDownSpin();
    }
    /**
     * Handle mouseup/touchend/mouseleave to stop spinning.
     * @private
     */
    _handleMouseUp(_e) {
      this.stopSpin();
    }
    /**
     * Handle keydown events on up button.
     * @private
     */
    _handleUpKeyDown(e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        if (e.repeat) return;
        this.startUpSpin();
      }
    }
    /**
     * Handle keyup events on up button.
     * @private
     */
    _handleUpKeyUp(e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.stopSpin();
      }
    }
    /**
     * Handle keydown events on down button.
     * @private
     */
    _handleDownKeyDown(e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        if (e.repeat) return;
        this.startDownSpin();
      }
    }
    /**
     * Handle keyup events on down button.
     * @private
     */
    _handleDownKeyUp(e) {
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.stopSpin();
      }
    }
    /**
     * Sanitize value before other capture listeners observe unsanitized input.
     * @private
     */
    _handleWindowChangeCapture(e) {
      const target = e.target;
      if (!target || target !== this.input) return;
      const currentValue = this.getValue();
      if (!Number.isFinite(currentValue)) return;
      const sanitized = this._applyConstraints(currentValue);
      if (sanitized !== currentValue) {
        this._setDisplay(sanitized, false);
      }
    }
    /**
     * Handle keydown events on the input element.
     * @private
     */
    _handleKeyDown(e) {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (e.repeat) return;
          this.startUpSpin();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (e.repeat) return;
          this.startDownSpin();
          break;
        case "Enter":
          this._checkValue(false);
          break;
      }
    }
    /**
     * Handle keyup events on the input element.
     * @private
     */
    _handleKeyUp(e) {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        this.stopSpin();
      }
    }
    /**
     * Handle wheel events on the input element.
     * @private
     */
    _handleWheel(e) {
      if (!this.settings.mousewheel) {
        return;
      }
      if (document.activeElement === this.input) {
        e.preventDefault();
        if (e.deltaY < 0) {
          this.upOnce();
        } else if (e.deltaY > 0) {
          this.downOnce();
        }
      }
    }
    /**
     * Set up mutation observer to watch for disabled/readonly attribute changes
     * @private
     */
    _setupMutationObserver() {
      if (typeof MutationObserver !== "undefined") {
        this._mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === "attributes") {
              if (mutation.attributeName === "disabled" || mutation.attributeName === "readonly") {
                this._updateButtonDisabledState();
              } else if (mutation.attributeName === "min" || mutation.attributeName === "max" || mutation.attributeName === "step") {
                this._syncSettingsFromNativeAttributes();
              }
            }
          });
        });
        this._mutationObserver.observe(this.input, {
          attributes: true,
          attributeFilter: ["disabled", "readonly", "min", "max", "step"]
        });
      }
    }
    /**
     * Update button disabled state based on input disabled/readonly state
     * @private
     */
    _updateButtonDisabledState() {
      const isDisabled = this.input.disabled || this.input.hasAttribute("readonly");
      if (this._upButton) {
        this._upButton.disabled = isDisabled;
      }
      if (this._downButton) {
        this._downButton.disabled = isDisabled;
      }
      if (isDisabled) {
        this.stopSpin();
      }
    }
    /**
     * Check if callbacks are properly paired and warn if not
     * @private
     */
    _checkCallbackPairing() {
      var _a, _b, _c, _d;
      const defCb = (v) => v;
      const hasBefore = this.settings.callback_before_calculation && this.settings.callback_before_calculation.toString() !== defCb.toString();
      const hasAfter = this.settings.callback_after_calculation && this.settings.callback_after_calculation.toString() !== defCb.toString();
      if (hasBefore && !hasAfter) {
        console.warn(
          "TouchSpin: callback_before_calculation is defined but callback_after_calculation is missing. These callbacks should be used together - one removes formatting, the other adds it back."
        );
      } else if (!hasBefore && hasAfter) {
        console.warn(
          "TouchSpin: callback_after_calculation is defined but callback_before_calculation is missing. These callbacks should be used together - one removes formatting, the other adds it back."
        );
      }
      if (hasBefore && hasAfter) {
        const testValues = [];
        const decimals = this.settings.decimals || 0;
        const formatValue = (n) => n.toFixed(decimals);
        const hasMin = this.settings.min !== null && this.settings.min !== void 0;
        const hasMax = this.settings.max !== null && this.settings.max !== void 0;
        if (hasMin && hasMax) {
          testValues.push(formatValue(this.settings.min), formatValue(this.settings.max));
        } else if (hasMin) {
          testValues.push(formatValue(this.settings.min));
        } else if (hasMax) {
          testValues.push(formatValue(this.settings.max));
        } else {
          testValues.push(decimals > 0 ? "50.55" : "50");
        }
        const failures = [];
        for (const testValue of testValues) {
          const afterResult = (_b = (_a = this.settings).callback_after_calculation) == null ? void 0 : _b.call(_a, testValue);
          if (afterResult === void 0) continue;
          const beforeResult = (_d = (_c = this.settings).callback_before_calculation) == null ? void 0 : _d.call(_c, afterResult);
          if (beforeResult === void 0) continue;
          if (beforeResult !== testValue) {
            failures.push(
              `"${testValue}" \u2192 after \u2192 "${afterResult}" \u2192 before \u2192 "${beforeResult}" (expected "${testValue}")`
            );
          }
        }
        if (failures.length > 0) {
          console.warn(
            "TouchSpin: Callbacks are not properly paired - round-trip test failed:\n" + failures.join("\n") + '\ncallback_before_calculation must reverse what callback_after_calculation does. For example, if after adds " USD", before must strip " USD".'
          );
        }
      }
    }
  };
  function TouchSpin(inputEl, opts) {
    var _a;
    if (!inputEl || inputEl.nodeName !== "INPUT") {
      console.warn("Must be an input.");
      return null;
    }
    if (opts !== void 0) {
      if (inputEl[INSTANCE_KEY]) {
        console.warn(
          "TouchSpin: Destroying existing instance and reinitializing. Consider using updateSettings() instead."
        );
        (_a = inputEl[INSTANCE_KEY]) == null ? void 0 : _a.destroy();
      }
      const core = new TouchSpinCore(inputEl, opts);
      inputEl[INSTANCE_KEY] = core;
      core.initDOMEventHandling();
      return core.toPublicApi();
    }
    if (!inputEl[INSTANCE_KEY]) {
      const core = new TouchSpinCore(inputEl, {});
      inputEl[INSTANCE_KEY] = core;
      core.initDOMEventHandling();
      return core.toPublicApi();
    }
    return inputEl[INSTANCE_KEY].toPublicApi();
  }
  var CORE_EVENTS = Object.freeze({
    MIN: "min",
    MAX: "max",
    START_SPIN: "startspin",
    START_UP: "startupspin",
    START_DOWN: "startdownspin",
    STOP_SPIN: "stopspin",
    STOP_UP: "stopupspin",
    STOP_DOWN: "stopdownspin"
  });

  // ../standalone/dist/chunk-SHREFLHY.js
  function mount(host, opts, renderer) {
    const element = typeof host === "string" ? document.querySelector(host) : host;
    if (!element) {
      throw new Error(
        `TouchSpin mount failed: element not found${typeof host === "string" ? ` (selector: "${host}")` : ""}`
      );
    }
    if (!(element instanceof HTMLInputElement)) {
      throw new Error("TouchSpin mount failed: element must be an HTMLInputElement");
    }
    return TouchSpin(element, {
      ...opts,
      renderer
    });
  }

  // ../../core/dist/renderer.js
  var TEST_ID_ATTRIBUTE = "data-testid";
  var TOUCHSPIN_ATTRIBUTE = "data-touchspin-injected";
  var AbstractRendererBase = class {
    constructor(input, settings, core) {
      this.wrapper = null;
      this.wrapperType = "wrapper";
      this.input = input;
      this.settings = settings;
      this.core = core;
    }
    /**
     * Finalize wrapper attributes as the last step of rendering.
     *
     * This method is called by Core after the renderer has completed all DOM construction
     * and event handler attachment. It adds the final attributes that signal rendering is complete:
     *
     * 1. data-testid="{input-testid}-wrapper" - Enables test element selection
     * 2. data-touchspin-injected="{wrapperType}" - Signals renderer has finished
     *
     * The presence of data-testid on the wrapper indicates that:
     * - All DOM elements have been created and positioned
     * - All event handlers have been attached by Core
     * - The component is fully initialized and ready for interaction
     *
     * Tests rely on this attribute to detect when components are ready.
     */
    finalizeWrapperAttributes() {
      var _a, _b, _c;
      const testId = this.input.getAttribute(TEST_ID_ATTRIBUTE);
      if (testId && !((_a = this.wrapper) == null ? void 0 : _a.hasAttribute(TEST_ID_ATTRIBUTE))) {
        (_b = this.wrapper) == null ? void 0 : _b.setAttribute(TEST_ID_ATTRIBUTE, `${testId}-wrapper`);
      }
      (_c = this.wrapper) == null ? void 0 : _c.setAttribute(TOUCHSPIN_ATTRIBUTE, this.wrapperType);
    }
    getUpButtonTestId() {
      return this.buildDataTestId("up");
    }
    getDownButtonTestId() {
      return this.buildDataTestId("down");
    }
    getPrefixTestId() {
      return this.buildDataTestId("prefix");
    }
    getPostfixTestId() {
      return this.buildDataTestId("postfix");
    }
    filterRendererSettings(schema, sourceSettings = this.settings) {
      const filteredSettings = {};
      for (const key in schema) {
        if (Object.hasOwn(sourceSettings, key)) {
          filteredSettings[key] = sourceSettings[key];
        }
      }
      return filteredSettings;
    }
    buildDataTestId(suffix) {
      const base = this.input.getAttribute(TEST_ID_ATTRIBUTE);
      return base ? ` data-testid="${base}-${suffix}"` : "";
    }
  };
  var AbstractRendererBase_default = AbstractRendererBase;
  var WRAPPER_TYPE_ADVANCED = "wrapper-advanced";
  var WRAPPER_READY_CLASS = "bootstrap-touchspin";
  var AbstractRendererSimple = class extends AbstractRendererBase_default {
    teardown() {
      this.removeInjectedElements();
    }
    removeInjectedElements() {
      this.removeInjectedNodesWithinWrapper();
      this.removeNearbyInjectedNodes();
    }
    removeInjectedNodesWithinWrapper() {
      const { wrapper } = this;
      if (!wrapper) return;
      wrapper.querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`).forEach((element) => element.remove());
      if (!wrapper.hasAttribute(TOUCHSPIN_ATTRIBUTE) || !wrapper.parentElement) {
        return;
      }
      const wrapperType = wrapper.getAttribute(TOUCHSPIN_ATTRIBUTE);
      if (wrapperType === WRAPPER_TYPE_ADVANCED) {
        wrapper.classList.remove(WRAPPER_READY_CLASS);
        wrapper.removeAttribute(TOUCHSPIN_ATTRIBUTE);
        return;
      }
      wrapper.parentElement.insertBefore(this.input, wrapper);
      wrapper.remove();
    }
    removeNearbyInjectedNodes() {
      const injectedNodes = document.querySelectorAll(`[${TOUCHSPIN_ATTRIBUTE}]`);
      injectedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node === this.input) return;
        if (!this.isNodeRelatedToInput(node)) return;
        node.remove();
      });
    }
    isNodeRelatedToInput(node) {
      var _a, _b;
      return node.contains(this.input) || ((_b = (_a = this.input.parentElement) == null ? void 0 : _a.contains(node)) != null ? _b : false);
    }
  };
  var AbstractRendererSimple_default = AbstractRendererSimple;

  // ../../../.yarn/__virtual__/@touchspin-renderer-tailwind-virtual-817596313c/1/packages/renderers/tailwind/dist/index.js
  var TailwindRenderer = class extends AbstractRendererSimple_default {
    constructor() {
      super(...arguments);
      this.prefixEl = null;
      this.postfixEl = null;
      this.initialFlexContainer = null;
    }
    init() {
      this.prefixEl = null;
      this.postfixEl = null;
      this.initialFlexContainer = this.input.closest(".flex.rounded-md");
      this.wrapper = this.buildInputGroup();
      const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
      const downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');
      this.prefixEl = this.wrapper.querySelector('[data-touchspin-injected="prefix"]');
      this.postfixEl = this.wrapper.querySelector('[data-touchspin-injected="postfix"]');
      this.core.attachUpEvents(upButton);
      this.core.attachDownEvents(downButton);
      this.core.observeSetting("prefix", (newValue) => this.updatePrefix(newValue));
      this.core.observeSetting("postfix", (newValue) => this.updatePostfix(newValue));
      this.core.observeSetting(
        "buttonup_class",
        (newValue) => this.updateButtonClass("up", newValue)
      );
      this.core.observeSetting(
        "buttondown_class",
        (newValue) => this.updateButtonClass("down", newValue)
      );
      this.core.observeSetting(
        "verticalupclass",
        (newValue) => this.updateVerticalButtonClass("up", newValue)
      );
      this.core.observeSetting(
        "verticaldownclass",
        (newValue) => this.updateVerticalButtonClass("down", newValue)
      );
      this.core.observeSetting(
        "verticalup",
        (newValue) => this.updateVerticalButtonText("up", newValue)
      );
      this.core.observeSetting(
        "verticaldown",
        (newValue) => this.updateVerticalButtonText("down", newValue)
      );
      this.core.observeSetting("buttonup_txt", (newValue) => this.updateButtonText("up", newValue));
      this.core.observeSetting(
        "buttondown_txt",
        (newValue) => this.updateButtonText("down", newValue)
      );
      this.core.observeSetting("prefix_extraclass", (_newValue) => this.updatePrefixClasses());
      this.core.observeSetting("postfix_extraclass", (_newValue) => this.updatePostfixClasses());
      this.core.observeSetting("input_classes", (_newValue) => this.updateInputClasses());
      this.core.observeSetting(
        "verticalbuttons",
        (newValue) => this.handleVerticalButtonsChange(newValue)
      );
      this.core.observeSetting(
        "focusablebuttons",
        (newValue) => this.updateButtonFocusability(newValue)
      );
    }
    // teardown() uses inherited removeInjectedElements() - no override needed
    buildInputGroup() {
      const closestContainer = this.input.closest(".flex");
      const existingContainer = closestContainer != null ? closestContainer : this.initialFlexContainer;
      if (existingContainer == null ? void 0 : existingContainer.classList.contains("rounded-md")) {
        return this.buildAdvancedInputGroup(existingContainer);
      } else {
        return this.buildBasicInputGroup();
      }
    }
    buildBasicInputGroup() {
      const _inputSize = this._detectInputSize();
      const isVertical = this.settings.verticalbuttons;
      let html;
      if (isVertical) {
        html = `
        <div class="flex rounded-md shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50 overflow-hidden">
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 rounded-l-md tailwind-addon ${this.settings.prefix_extraclass || ""}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ""}</span>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ""}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ""}</span>
          ${this.buildVerticalButtons()}
        </div>
      `;
      } else {
        html = `
        <div class="flex rounded-md shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:disabled]:opacity-60 has-[:disabled]:bg-gray-50 has-[:read-only]:bg-gray-50 overflow-hidden">
          <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-y-0 border-r border-l-0 rtl:border-l rtl:border-r-0 border-gray-300 tailwind-btn ${this.settings.buttondown_class || ""}" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.buttondown_txt}</button>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ""}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ""}</span>
          <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ""}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ""}</span>
          <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-y-0 border-l border-r-0 rtl:border-r rtl:border-l-0 border-gray-300 tailwind-btn ${this.settings.buttonup_class || ""}" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.buttonup_txt}</button>
        </div>
      `;
      }
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html.trim();
      const wrapper = tempDiv.firstChild;
      if (this.input.parentElement) {
        this.input.parentElement.insertBefore(wrapper, this.input);
      }
      const prefixEl = wrapper.querySelector('[data-touchspin-injected="prefix"]');
      if (prefixEl) {
        wrapper.insertBefore(this.input, prefixEl.nextSibling);
      } else {
        const postfixEl = wrapper.querySelector('[data-touchspin-injected="postfix"]');
        if (postfixEl) wrapper.insertBefore(this.input, postfixEl);
      }
      this.input.className = this.input.className.replace("form-control", "");
      const inputClasses = this.settings.input_classes;
      if (inputClasses && inputClasses.trim()) {
        const customClasses = inputClasses.split(" ").filter((cls) => cls.trim());
        this.input.classList.add("ts-input", ...customClasses);
      } else {
        this.input.classList.add(
          "ts-input",
          "flex-1",
          "px-3",
          "py-2",
          "border-0",
          "bg-transparent",
          "focus:outline-none",
          "text-gray-900",
          "placeholder-gray-500"
        );
      }
      this._applySizeClasses(wrapper);
      this.hideEmptyPrefixPostfix(wrapper);
      return wrapper;
    }
    /**
     * Ensures the input element is a child of the given container.
     * Fixes DOM insertion bug during layout rebuilds.
     */
    ensureInputInContainer(existingContainer) {
      if (this.input.parentElement === existingContainer) {
        return;
      }
      existingContainer.appendChild(this.input);
    }
    buildAdvancedInputGroup(existingContainer) {
      this.wrapperType = "wrapper-advanced";
      const inputTestId = this.input.getAttribute("data-testid");
      const existingWrapperTestId = existingContainer.getAttribute("data-testid");
      if (!existingWrapperTestId && inputTestId) {
        existingContainer.setAttribute("data-testid", `${inputTestId}-wrapper`);
      }
      this.ensureInputInContainer(existingContainer);
      const isVertical = this.settings.verticalbuttons;
      let elementsHtml;
      if (isVertical) {
        elementsHtml = `
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ""}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ""}</span>
        ${this.buildVerticalButtons()}
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ""}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ""}</span>
      `;
      } else {
        elementsHtml = `
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ""}" data-touchspin-injected="prefix"${this.getPrefixTestId()}>${this.settings.prefix || ""}</span>
        <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-y-0 border-r border-l-0 rtl:border-l rtl:border-r-0 border-gray-300 tailwind-btn ${this.settings.buttondown_class || ""}" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.buttondown_txt}</button>
        <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium border-y-0 border-l border-r-0 rtl:border-r rtl:border-l-0 border-gray-300 tailwind-btn ${this.settings.buttonup_class || ""}" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.buttonup_txt}</button>
        <span class="inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ""}" data-touchspin-injected="postfix"${this.getPostfixTestId()}>${this.settings.postfix || ""}</span>
      `;
      }
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = elementsHtml;
      const prefixEl = tempDiv.querySelector('[data-touchspin-injected="prefix"]');
      if (prefixEl) existingContainer.insertBefore(prefixEl, this.input);
      if (isVertical) {
        const verticalWrapper = tempDiv.querySelector(
          '[data-touchspin-injected="vertical-wrapper"]'
        );
        if (verticalWrapper) existingContainer.insertBefore(verticalWrapper, this.input.nextSibling);
      } else {
        const downButton = tempDiv.querySelector('[data-touchspin-injected="down"]');
        if (downButton) existingContainer.insertBefore(downButton, this.input);
        const upButton = tempDiv.querySelector('[data-touchspin-injected="up"]');
        if (upButton) existingContainer.insertBefore(upButton, this.input.nextSibling);
      }
      const postfixEl = tempDiv.querySelector('[data-touchspin-injected="postfix"]');
      if (postfixEl) existingContainer.appendChild(postfixEl);
      this.prefixEl = prefixEl;
      this.postfixEl = postfixEl;
      this.input.className = this.input.className.replace("form-control", "");
      this.input.classList.add(
        "flex-1",
        "px-3",
        "py-2",
        "border-0",
        "bg-transparent",
        "focus:outline-none",
        "text-gray-900",
        "placeholder-gray-500"
      );
      this._applySizeClasses(existingContainer);
      this.hideEmptyPrefixPostfix(existingContainer);
      return existingContainer;
    }
    _detectInputSize() {
      const classList = this.input.className;
      if (classList.includes("text-sm") || classList.includes("py-1")) {
        return "text-sm py-1 px-2";
      } else if (classList.includes("text-lg") || classList.includes("py-3")) {
        return "text-lg py-3 px-4";
      }
      return "text-base py-2 px-3";
    }
    _applySizeClasses(wrapper = this.wrapper) {
      if (!wrapper) return;
      const s = this._detectInputSize();
      if (s.includes("text-sm")) {
        wrapper.classList.add("text-sm");
        wrapper.querySelectorAll(".tailwind-btn").forEach((btn) => {
          btn.classList.add("py-1", "px-2", "text-sm");
        });
        wrapper.querySelectorAll(".tailwind-addon").forEach((addon) => {
          addon.classList.add("py-1", "px-2", "text-sm");
        });
      } else if (s.includes("text-lg")) {
        wrapper.classList.add("text-lg");
        wrapper.querySelectorAll(".tailwind-btn").forEach((btn) => {
          btn.classList.add("py-3", "px-4", "text-lg");
        });
        wrapper.querySelectorAll(".tailwind-addon").forEach((addon) => {
          addon.classList.add("py-3", "px-4", "text-lg");
        });
      }
    }
    hideEmptyPrefixPostfix(wrapper = this.wrapper) {
      if (!wrapper) return;
      const prefixEl = this.prefixEl || wrapper.querySelector('[data-touchspin-injected="prefix"]');
      const postfixEl = this.postfixEl || wrapper.querySelector('[data-touchspin-injected="postfix"]');
      if (prefixEl && (!this.settings.prefix || this.settings.prefix === "")) {
        prefixEl.style.display = "none";
      }
      if (postfixEl && (!this.settings.postfix || this.settings.postfix === "")) {
        postfixEl.style.display = "none";
      }
    }
    updatePrefix(value) {
      const prefixEl = this.prefixEl;
      if (value && value !== "") {
        if (prefixEl) {
          prefixEl.textContent = value;
          prefixEl.style.display = "";
          prefixEl.className = `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ""}`.trim();
        }
      } else if (prefixEl) {
        prefixEl.style.display = "none";
      }
    }
    updatePostfix(value) {
      const postfixEl = this.postfixEl;
      if (value && value !== "") {
        if (postfixEl) {
          postfixEl.textContent = value;
          postfixEl.style.display = "";
          postfixEl.className = `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ""}`.trim();
        }
      } else if (postfixEl) {
        postfixEl.style.display = "none";
      }
    }
    updateButtonClass(type, className) {
      if (!this.wrapper) return;
      const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        const borderClass = type === "down" ? "border-y-0 border-r border-l-0 rtl:border-l rtl:border-r-0" : "border-y-0 border-l border-r-0 rtl:border-r rtl:border-l-0";
        const baseClasses = `inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 text-gray-700 font-medium ${borderClass} border-gray-300 tailwind-btn`;
        button.className = `${baseClasses} ${className || ""}`;
      }
    }
    buildVerticalButtons() {
      return `
      <div class="flex flex-col" data-touchspin-injected="vertical-wrapper">
        <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="inline-flex items-center justify-center px-2 py-1 text-xs ${this.settings.verticalupclass || "bg-gray-100 hover:bg-gray-200 text-gray-700"} font-medium border border-t-0 border-r-0 rtl:border-r rtl:border-l-0 border-gray-300 tailwind-btn disabled:opacity-50 disabled:cursor-not-allowed" data-touchspin-injected="up"${this.getUpButtonTestId()} type="button" aria-label="Increase value">${this.settings.verticalup}</button>
        <button tabindex="${this.settings.focusablebuttons ? "0" : "-1"}" class="inline-flex items-center justify-center px-2 py-1 text-xs ${this.settings.verticaldownclass || "bg-gray-100 hover:bg-gray-200 text-gray-700"} font-medium border border-t-0 border-r-0 border-b-0 rtl:border-r rtl:border-l-0 border-gray-300 tailwind-btn disabled:opacity-50 disabled:cursor-not-allowed" data-touchspin-injected="down"${this.getDownButtonTestId()} type="button" aria-label="Decrease value">${this.settings.verticaldown}</button>
      </div>
    `;
    }
    updateVerticalButtonClass(type, className) {
      if (!this.wrapper) return;
      const verticalWrapper = this.wrapper.querySelector(
        '[data-touchspin-injected="vertical-wrapper"]'
      );
      if (verticalWrapper) {
        const button = verticalWrapper.querySelector(
          `[data-touchspin-injected="${type}"]`
        );
        if (button) {
          const baseClasses = "inline-flex items-center justify-center px-2 py-1 text-xs font-medium border border-gray-300 tailwind-btn disabled:opacity-50 disabled:cursor-not-allowed";
          const borderClasses = type === "up" ? "border-t-0 border-r-0 rtl:border-r rtl:border-l-0" : "border-t-0 border-r-0 border-b-0 rtl:border-r rtl:border-l-0";
          button.className = `${baseClasses} ${borderClasses} ${className || "bg-gray-100 hover:bg-gray-200 text-gray-700"}`;
        }
      }
    }
    updateVerticalButtonText(type, text) {
      if (!this.wrapper) return;
      const verticalWrapper = this.wrapper.querySelector(
        '[data-touchspin-injected="vertical-wrapper"]'
      );
      if (verticalWrapper) {
        const button = verticalWrapper.querySelector(
          `[data-touchspin-injected="${type}"]`
        );
        if (button) {
          button.textContent = text != null ? text : "";
        }
      }
    }
    updateButtonText(type, text) {
      if (!this.wrapper) return;
      const button = this.wrapper.querySelector(`[data-touchspin-injected="${type}"]`);
      if (button) {
        button.textContent = text != null ? text : "";
      }
    }
    updatePrefixClasses() {
      const prefixEl = this.prefixEl;
      if (prefixEl) {
        prefixEl.className = `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.prefix_extraclass || ""}`.trim();
      }
    }
    updatePostfixClasses() {
      const postfixEl = this.postfixEl;
      if (postfixEl) {
        postfixEl.className = `inline-flex items-center px-3 py-2 bg-gray-50 text-gray-600 border-0 tailwind-addon ${this.settings.postfix_extraclass || ""}`.trim();
      }
    }
    updateInputClasses() {
      this.input.className = this.input.className.replace(/ts-input/g, "").trim();
      const inputClasses = this.settings.input_classes;
      if (inputClasses && inputClasses.trim()) {
        const customClasses = inputClasses.split(" ").filter((cls) => cls.trim());
        this.input.classList.add("ts-input", ...customClasses);
      } else {
        this.input.classList.add(
          "ts-input",
          "flex-1",
          "px-3",
          "py-2",
          "border-0",
          "bg-transparent",
          "focus:outline-none",
          "text-gray-900",
          "placeholder-gray-500"
        );
      }
    }
    handleVerticalButtonsChange(_newValue) {
      this.rebuildDOM();
    }
    rebuildDOM() {
      this.removeInjectedElements();
      this.wrapper = null;
      this.prefixEl = null;
      this.postfixEl = null;
      this.buildAndAttachDOM();
      this.finalizeWrapperAttributes();
    }
    buildAndAttachDOM() {
      this.wrapper = this.buildInputGroup();
      const upButton = this.wrapper.querySelector('[data-touchspin-injected="up"]');
      const downButton = this.wrapper.querySelector('[data-touchspin-injected="down"]');
      this.prefixEl = this.wrapper.querySelector('[data-touchspin-injected="prefix"]');
      this.postfixEl = this.wrapper.querySelector('[data-touchspin-injected="postfix"]');
      this.core.attachUpEvents(upButton);
      this.core.attachDownEvents(downButton);
    }
    updateButtonFocusability(newValue) {
      if (!this.wrapper) return;
      const buttons = this.wrapper.querySelectorAll(
        '[data-touchspin-injected="up"], [data-touchspin-injected="down"]'
      );
      const tabindex = newValue ? "0" : "-1";
      buttons.forEach((button) => {
        button.setAttribute("tabindex", tabindex);
      });
    }
  };
  var TailwindRenderer_default = TailwindRenderer;

  // ../standalone/dist/tailwind.js
  function mount2(host, opts) {
    return mount(host, opts, TailwindRenderer_default);
  }

  // src/index.ts
  function installJQueryAdapter($, mountFn) {
    $.fn.TouchSpin = function(options, arg) {
      if (typeof options === "string") {
        const cmd = String(options).toLowerCase();
        let ret;
        this.each(function() {
          const inputEl = this;
          const inst = inputEl.__touchspin;
          if ((cmd === "getvalue" || cmd === "get") && ret === void 0) {
            if (inst) {
              ret = inst.getValue();
            } else {
              ret = inputEl.value;
            }
            return;
          }
          if (!inst) return;
          switch (cmd) {
            case "destroy":
              inst.destroy();
              delete inputEl.__touchspin;
              break;
            case "uponce":
              inst.upOnce();
              break;
            case "downonce":
              inst.downOnce();
              break;
            case "startupspin":
              inst.startUpSpin();
              break;
            case "startdownspin":
              inst.startDownSpin();
              break;
            case "stopspin":
              inst.stopSpin();
              break;
            case "updatesettings":
              inst.updateSettings(arg || {});
              break;
            case "setvalue":
            case "set":
              inst.setValue(arg);
              break;
          }
        });
        return ret === void 0 ? this : ret;
      }
      return this.each(function() {
        const $input = $(this);
        const inputEl = this;
        let inst = null;
        try {
          inst = mountFn(inputEl, options || {});
        } catch (_error) {
          return;
        }
        if (!inst) {
          return;
        }
        inputEl.__touchspin = inst;
        const jqueryTeardown = () => {
          $input.off(
            `${TouchSpinCallableEvent.UP_ONCE} ${TouchSpinCallableEvent.DOWN_ONCE} ${TouchSpinCallableEvent.START_UP_SPIN} ${TouchSpinCallableEvent.START_DOWN_SPIN} ${TouchSpinCallableEvent.STOP_SPIN} ${TouchSpinCallableEvent.UPDATE_SETTINGS} ${TouchSpinCallableEvent.DESTROY} blur.touchspin`
          );
        };
        inst.registerTeardown(jqueryTeardown);
        $input.on(TouchSpinCallableEvent.UP_ONCE, () => {
          const api = inputEl.__touchspin;
          if (api) api.upOnce();
        });
        $input.on(TouchSpinCallableEvent.DOWN_ONCE, () => {
          const api = inputEl.__touchspin;
          if (api) api.downOnce();
        });
        $input.on(TouchSpinCallableEvent.START_UP_SPIN, () => {
          const api = inputEl.__touchspin;
          if (api) api.startUpSpin();
        });
        $input.on(TouchSpinCallableEvent.START_DOWN_SPIN, () => {
          const api = inputEl.__touchspin;
          if (api) api.startDownSpin();
        });
        $input.on(TouchSpinCallableEvent.STOP_SPIN, () => {
          const api = inputEl.__touchspin;
          if (api) api.stopSpin();
        });
        $input.on(TouchSpinCallableEvent.UPDATE_SETTINGS, (_e, o) => {
          const api = inputEl.__touchspin;
          if (api) api.updateSettings(o || {});
        });
        $input.on(TouchSpinCallableEvent.DESTROY, () => {
          const api = inputEl.__touchspin;
          if (api) {
            api.destroy();
            delete inputEl.__touchspin;
          }
        });
        $input.on("blur.touchspin", () => {
          var _a;
          const core = inputEl._touchSpinCore;
          (_a = core == null ? void 0 : core._checkValue) == null ? void 0 : _a.call(core, true);
        });
      });
    };
  }
  function autoInstall(mountFn) {
    const $ = globalThis.jQuery;
    if ($) {
      installJQueryAdapter($, mountFn);
    } else {
      console.warn(
        "jQuery adapter: jQuery not found on window. Call installJQueryAdapter($, mountFn) manually."
      );
    }
  }

  // src/tailwind.ts
  autoInstall(mount2);
})();
//# sourceMappingURL=tailwind.global.js.map