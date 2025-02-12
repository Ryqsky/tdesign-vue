import { PropType } from 'vue';
import { ChevronRightIcon } from 'tdesign-icons-vue';
import { prefix } from '../../config';

// utils
import CLASSNAMES from '../../utils/classnames';
import ripple from '../../utils/ripple';
import mixins from '../../utils/mixins';

// common logic
import { getFullPathLabel } from '../utils/helper';
import { getCascaderItemClass, getCascaderItemIconClass, getLabelIsEllipsis } from '../utils/item';
import { getKeepAnimationMixins } from '../../config-provider/config-receiver';

// component
import Loading from '../../loading';
import Checkbox, { CheckboxProps } from '../../checkbox/index';
import Tooltip from '../../tooltip/index';

// type
import { ClassName } from '../../common';
import {
  ContextType, CascaderContextType, CascaderItemPropsType, TreeNodeValue, TreeNode,
} from '../interface';

const name = `${prefix}-cascader-item`;
const ComponentClassName = `${prefix}-cascader__item`;

const keepAnimationMixins = getKeepAnimationMixins();

export default mixins(keepAnimationMixins).extend({
  name,

  directives: { ripple },
  components: {
    Tooltip,
  },
  props: {
    node: {
      type: Object as PropType<CascaderItemPropsType['node']>,
      default() {
        return {} as TreeNode;
      },
    },
    cascaderContext: {
      type: Object as PropType<CascaderItemPropsType['cascaderContext']>,
    },
  },

  computed: {
    itemClass(): ClassName {
      return getCascaderItemClass(prefix, this.node, CLASSNAMES, this.cascaderContext);
    },
    iconClass(): ClassName {
      return getCascaderItemIconClass(prefix, this.node, CLASSNAMES, this.cascaderContext);
    },
  },
  render() {
    const {
      node, itemClass, iconClass, cascaderContext,
    } = this;

    const handleClick = (e: Event) => {
      e.stopPropagation();
      const ctx: ContextType = {
        e,
        node,
      };
      this.$emit('click', ctx);
    };

    const handleChange: CheckboxProps['onChange'] = (e) => {
      const ctx = {
        e,
        node,
      };
      this.$emit('change', ctx);
    };

    const handleMouseenter = (e: Event) => {
      e.stopPropagation();
      const ctx: ContextType = {
        e,
        node,
      };
      this.$emit('mouseenter', ctx);
    };

    function RenderLabelInner(node: TreeNode, cascaderContext: CascaderContextType) {
      const { filterActive, inputVal } = cascaderContext;
      const labelText = filterActive ? getFullPathLabel(node) : node.label;
      if (filterActive) {
        const texts = labelText.split(inputVal);
        const doms = [];
        for (let index = 0; index < texts.length; index++) {
          doms.push(<span key={index}>{texts[index]}</span>);
          if (index === texts.length - 1) break;
          doms.push(
            <span key={`${index}filter`} class={`${name}-label--filter`}>
              {inputVal}
            </span>,
          );
        }
        return doms;
      }
      return labelText;
    }

    function RenderLabelContent(node: TreeNode, cascaderContext: CascaderContextType) {
      const label = RenderLabelInner(node, cascaderContext);
      const isEllipsis = getLabelIsEllipsis(node, cascaderContext.size);
      const labelNode = (
        <span class={[`${ComponentClassName}-label`]} role="label">
          {label}
        </span>
      );
      if (isEllipsis) {
        return (
          <Tooltip content={node.label} placement="top-left">
            {labelNode}
          </Tooltip>
        );
      }
      return labelNode;
    }

    function RenderCheckBox(
      node: TreeNode,
      cascaderContext: CascaderContextType,
      handleChange: CheckboxProps['onChange'],
    ) {
      const {
        checkProps, value, max, size,
      } = cascaderContext;
      const label = RenderLabelInner(node, cascaderContext);
      return (
        <Checkbox
          checked={node.checked}
          indeterminate={node.indeterminate}
          disabled={node.isDisabled() || ((value as TreeNodeValue[]).length >= max && max !== 0)}
          name={node.value}
          size={size}
          onChange={handleChange}
          {...checkProps}
        >
          {label}
        </Checkbox>
      );
    }

    return (
      <li v-ripple={this.keepAnimation.ripple} class={itemClass} onClick={handleClick} onMouseenter={handleMouseenter}>
        {cascaderContext.multiple
          ? RenderCheckBox(node, cascaderContext, handleChange)
          : RenderLabelContent(node, cascaderContext)}
        {node.children
          && (node.loading ? <Loading class={iconClass} size="small" /> : <ChevronRightIcon class={iconClass} />)}
      </li>
    );
  },
});
