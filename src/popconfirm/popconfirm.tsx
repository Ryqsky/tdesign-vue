import mixins from '../utils/mixins';
import getLocalRecevierMixins from '../locale/local-receiver';
import { prefix } from '../config';
import Popup, { PopupProps } from '../popup/index';
import props from './props';
import { renderTNodeJSX, renderContent } from '../utils/render-tnode';
import { PopconfirmVisibleChangeContext, TdPopconfirmProps } from './type';

const name = `${prefix}-popconfirm`;
const popupName = `${prefix}-popup`;

export default mixins(getLocalRecevierMixins('popconfirm')).extend({
  name,
  props: { ...props },
  model: {
    prop: 'visible',
    event: 'visible-change',
  },
  data() {
    return {
      name,
      popupName,
    };
  },
  computed: {
    iconName(): string {
      const iconMap = {
        default: 'info-circle-filled',
        warning: 'error-circle-filled',
        danger: 'error-circle-filled',
      };
      return iconMap[this.theme] || '';
    },
    iconColor(): string {
      let color = '';
      switch (this.theme) {
        case 'warning':
          color = '#FFAA00';
          break;
        case 'danger':
          color = '#E34D59';
          break;
        default:
          color = '#0052D9';
      }
      return `color:${color}`;
    },
    innerPopupProps(): PopupProps {
      return {
        showArrow: this.showArrow,
        overlayClassName: name,
        trigger: 'manual',
        destroyOnClose: this.destroyOnClose,
        placement: this.placement,
        ...this.popupProps,
      };
    },
  },
  methods: {
    handleCancel(e: MouseEvent) {
      this.$emit('cancel', { e });
      this.onCancel && this.onCancel({ e });
      const cancelContext: PopconfirmVisibleChangeContext = { e, trigger: 'cancel' };
      this.$emit('visible-change', false, cancelContext);
      this.onVisibleChange && this.onVisibleChange(false, cancelContext);
    },
    handleConfirm(e: MouseEvent) {
      this.$emit('confirm', { e });
      this.onConfirm && this.onConfirm({ e });
      const confirmContext: PopconfirmVisibleChangeContext = { e, trigger: 'confirm' };
      this.$emit('visible-change', false, confirmContext);
      this.onVisibleChange && this.onVisibleChange(false, confirmContext);
    },
    renderIcon() {
      // 优先级 slot > Funtion
      if (this.$scopedSlots.icon) {
        return this.$scopedSlots.icon(null);
      }
      const arg = this.icon;
      if (typeof arg === 'function') {
        return (arg as Function)();
      }
      return <t-icon name={this.iconName} style={this.iconColor} />;
    },
    getBtnText(api: TdPopconfirmProps['cancelBtn']) {
      return typeof api === 'object' ? api.content : api;
    },
    getBtnProps(api: TdPopconfirmProps['confirmBtn']) {
      return typeof api === 'object' ? api : {};
    },
    renderCancel(cancelBtn: TdPopconfirmProps['cancelBtn']) {
      return (
        <t-button theme="default" size='small' props={this.getBtnProps(cancelBtn)}>
          {this.getBtnText(cancelBtn)}
        </t-button>
      );
    },
    renderConfirm(confirmBtn: TdPopconfirmProps['confirmBtn']) {
      return (
        <t-button theme="primary" size='small' props={this.getBtnProps(confirmBtn)}>
          {this.getBtnText(confirmBtn)}
        </t-button>
      );
    },
    onPopupVisibleChange(val: boolean, context: PopconfirmVisibleChangeContext) {
      this.$emit('visible-change', val, context);
      this.onVisibleChange && this.onVisibleChange(val, context);
    },
  },
  render() {
    const triggerElement = renderContent(this, 'default', 'triggerElement');
    const baseTypes = ['string', 'object'];
    let confirmBtn = null;
    if (![undefined, null].includes(this.confirmBtn)) {
      const mBtn = this.confirmBtn || this.t(this.locale.confirm);
      confirmBtn = baseTypes.includes(typeof mBtn)
        ? this.renderConfirm(mBtn)
        : renderTNodeJSX(this, 'confirmBtn');
    }
    let cancelBtn = null;
    if (![undefined, null].includes(this.cancelBtn)) {
      const cBtn = this.cancelBtn || this.t(this.locale.cancel);
      cancelBtn = baseTypes.includes(typeof cBtn)
        ? this.renderCancel(cBtn)
        : renderTNodeJSX(this, 'cancelBtn');
    }
    return (
      <div>
        <Popup
          ref='popup'
          visible={this.visible}
          props={this.innerPopupProps}
          on={{ 'visible-change': this.onPopupVisibleChange }}
        >
          <template slot='content' role='poppconfirm'>
            <div class={`${name}__content`}>
              <div class={`${name}__body`}>
                {this.renderIcon()}
                <div class={`${name}__inner`}>
                  {renderTNodeJSX(this, 'content')}
                </div>
              </div>
              {Boolean(cancelBtn || confirmBtn) && (
                <div class='t-popconfirm__buttons'>
                  <span class='t-popconfirm__cancel' onClick={this.handleCancel}>{cancelBtn}</span>
                  <span class='t-popconfirm__confirm' onClick={this.handleConfirm}>{confirmBtn}</span>
                </div>
              )}
            </div>
          </template>
          {triggerElement}
        </Popup>
      </div>
    );
  },
});
