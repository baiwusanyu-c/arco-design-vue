import type { PropType, CSSProperties } from 'vue';
import { computed, defineComponent, reactive, ref, toRefs, watch } from 'vue';
import type { Data } from '../_utils/types';
import { getPrefixCls } from '../_utils/global-config';
import { SIZES } from '../_utils/constant';
import Pager from './page-item.vue';
import StepPager from './page-item-step.vue';
import EllipsisPager from './page-item-ellipsis.vue';
import PageJumper from './page-jumper.vue';
import PageOptions from './page-options.vue';
import { useI18n } from '../locale';
import { isFunction } from '../_utils/is';
import type { PageItemType } from './interface';
import { SelectProps } from '../select';

export default defineComponent({
  name: 'Pagination',
  props: {
    /**
     * @zh 数据总数
     * @en Total number of data
     */
    total: {
      type: Number,
      required: true,
    },
    /**
     * @zh 当前的页数
     * @en Current page number
     * @vModel
     */
    current: Number,
    /**
     * @zh 默认的页数（非受控状态）
     * @en The default number of pages (uncontrolled state)
     */
    defaultCurrent: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 每页展示的数据条数
     * @en Number of data items displayed per page
     * @vModel
     */
    pageSize: Number,
    /**
     * @zh 默认每页展示的数据条数（非受控状态）
     * @en The number of data items displayed per page by default (uncontrolled state)
     */
    defaultPageSize: {
      type: Number,
      default: 10,
    },
    /**
     * @zh 是否禁用
     * @en Whether to disable
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 单页时是否隐藏分页
     * @en Whether to hide pagination when single page
     */
    hideOnSinglePage: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否为简单模式
     * @en Whether it is simple mode
     */
    simple: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示数据总数
     * @en Whether to display the total number of data
     */
    showTotal: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示更多按钮
     * @en Whether to show more buttons
     */
    showMore: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示跳转
     * @en Whether to show jump
     */
    showJumper: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否显示数据条数选择器
     * @en Whether to display the data number selector
     */
    showPageSize: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 数据条数选择器的选项列表
     * @en Selection list of data number selector
     */
    pageSizeOptions: {
      type: Array as PropType<number[]>,
      default: () => [10, 20, 30, 40, 50],
    },
    /**
     * @zh 数据条数选择器的Props
     * @en Props of data number selector
     */
    pageSizeProps: {
      type: Object as PropType<SelectProps>,
    },
    /**
     * @zh 分页选择器的大小
     * @en The size of the page selector
     * @values 'mini', 'small', 'medium', 'large'
     */
    size: {
      type: String as PropType<typeof SIZES[number]>,
      default: 'medium',
    },
    /**
     * @zh 分页按钮的样式
     * @en The style of the paging button
     */
    pageItemStyle: {
      type: Object as PropType<CSSProperties>,
    },
    /**
     * @zh 当前分页按钮的样式
     * @en The style of the current paging button
     */
    activePageItemStyle: {
      type: Object as PropType<CSSProperties>,
    },
    // not opened
    bufferSize: {
      type: Number,
      default: 2,
    },
    // for JSX
    onChange: {
      type: Function as PropType<(value: number) => void>,
    },
    onPageSizeChange: {
      type: Function as PropType<(value: number) => void>,
    },
  },
  emits: [
    'update:current',
    'update:pageSize',
    /**
     * @zh 页码改变时触发
     * @en Triggered when page number changes
     * @property {number} page
     */
    'change',
    /**
     * @zh 数据条数改变时触发
     * @en Triggered when the number of data items changes
     * @property {number} pageSize
     */
    'pageSizeChange',
  ],
  /**
   * @zh 分页按钮
   * @en Page item
   * @slot pageItem
   * @binding {PageItemType} type The type of page item
   * @binding {number} page The page number of the paging button (exists only when `type='page'`)
   * @binding {VNode} element Default page item
   */
  setup(props, { emit, slots }) {
    const prefixCls = getPrefixCls('pagination');
    const { t } = useI18n();
    const { disabled, pageItemStyle, activePageItemStyle } = toRefs(props);

    const _current = ref(props.defaultCurrent);
    const _pageSize = ref(props.defaultPageSize);
    const computedCurrent = computed(() => props.current ?? _current.value);
    const computedPageSize = computed(() => props.pageSize ?? _pageSize.value);

    const pages = computed(() =>
      Math.ceil(props.total / computedPageSize.value)
    );

    const handleClick = (page: number) => {
      if (page !== computedCurrent.value) {
        _current.value = page;
        emit('update:current', page);
        emit('change', page);
      }
    };

    const handlePageSizeChange = (pageSize: number) => {
      _pageSize.value = pageSize;
      emit('update:pageSize', pageSize);
      emit('pageSizeChange', pageSize);
    };

    const pagerProps = reactive({
      current: computedCurrent,
      pages,
      disabled,
      style: pageItemStyle,
      activeStyle: activePageItemStyle,
      onClick: handleClick,
    });

    const getPageItemElement = (type: PageItemType, props: Data = {}) => {
      if (type === 'more') {
        return <EllipsisPager {...props} {...pagerProps} />;
      }
      if (type === 'previous') {
        return <StepPager type="previous" {...props} {...pagerProps} />;
      }
      if (type === 'next') {
        return <StepPager type="next" {...props} {...pagerProps} />;
      }

      return <Pager {...props} {...pagerProps} />;
    };

    const renderPageItem = (
      page: number,
      type: PageItemType,
      element: JSX.Element
    ) => {
      if (isFunction(slots.pageItem)) {
        return slots.pageItem({ page, type, element });
      }
      return element;
    };

    const pageList = computed(() => {
      const pageList: Array<JSX.Element | JSX.Element[]> = [];

      if (pages.value < 6 + props.bufferSize * 2) {
        for (let i = 1; i <= pages.value; i++) {
          pageList.push(
            renderPageItem(
              i,
              'page',
              getPageItemElement('page', { key: i, pageNumber: i })
            )
          );
        }
      } else {
        let left = 1;
        let right = pages.value;
        let hasLeftEllipsis = false;
        let hasRightEllipsis = false;

        if (computedCurrent.value > 2 * props.bufferSize) {
          hasLeftEllipsis = true;
          left = Math.min(
            computedCurrent.value - 2,
            pages.value - 2 * props.bufferSize
          );
        }
        if (computedCurrent.value < pages.value - 3) {
          hasRightEllipsis = true;
          right = Math.max(computedCurrent.value + 2, 2 * props.bufferSize + 1);
        }

        if (hasLeftEllipsis) {
          pageList.push(
            renderPageItem(
              1,
              'page',
              getPageItemElement('page', { key: 1, pageNumber: 1 })
            )
          );
          pageList.push(
            renderPageItem(
              0,
              'more',
              getPageItemElement('more', {
                key: 'left-ellipsis-pager',
                step: -(props.bufferSize * 2 + 1),
              })
            )
          );
        }

        for (let i = left; i <= right; i++) {
          pageList.push(
            renderPageItem(
              i,
              'page',
              getPageItemElement('page', { key: i, pageNumber: i })
            )
          );
        }

        if (hasRightEllipsis) {
          pageList.push(
            renderPageItem(
              0,
              'more',
              getPageItemElement('more', {
                key: 'right-ellipsis-pager',
                step: props.bufferSize * 2 + 1,
              })
            )
          );
          pageList.push(
            renderPageItem(
              pages.value,
              'page',
              getPageItemElement('page', {
                key: pages.value,
                pageNumber: pages.value,
              })
            )
          );
        }
      }

      return pageList;
    });

    const renderPager = () => {
      if (props.simple) {
        return (
          <span class={`${prefixCls}-simple`}>
            {renderPageItem(
              0,
              'previous',
              getPageItemElement('previous', { simple: true })
            )}
            <PageJumper
              current={computedCurrent.value}
              pages={pages.value}
              simple
              onChange={handleClick}
            />
            {renderPageItem(
              0,
              'next',
              getPageItemElement('next', { simple: true })
            )}
          </span>
        );
      }

      return (
        <ul class={`${prefixCls}-list`}>
          {renderPageItem(0, 'previous', getPageItemElement('previous'))}
          {pageList.value}
          {props.showMore &&
            renderPageItem(
              0,
              'more',
              getPageItemElement('more', {
                key: 'more',
                step: props.bufferSize * 2 + 1,
              })
            )}
          {renderPageItem(0, 'next', getPageItemElement('next'))}
        </ul>
      );
    };

    // When the number of data items changes, recalculate the page number
    watch(computedPageSize, () => {
      if (computedCurrent.value !== 1) {
        _current.value = 1;
        emit('update:current', 1);
        emit('change', 1);
      }

      // if (curPageSize !== prePageSize && computedCurrent.value !== 1) {
      //   let page = computedCurrent.value;
      //   if (curPageSize < prePageSize) {
      //     page -= 1;
      //   }
      //   const newPage = Math.ceil((page * prePageSize) / curPageSize);
      //   if (newPage !== computedCurrent.value) {
      //     _current.value = newPage;
      //     emit('update:current', page);
      //     emit('change', newPage);
      //   }
      // }
    });

    const cls = computed(() => [
      prefixCls,
      `${prefixCls}-size-${props.size}`,
      {
        [`${prefixCls}-simple`]: props.simple,
        [`${prefixCls}-disabled`]: props.disabled,
      },
    ]);

    return () => {
      if (props.hideOnSinglePage && pages.value <= 1) {
        return null;
      }

      return (
        <div class={cls.value}>
          {props.showTotal && (
            <span class={`${prefixCls}-total`}>
              {t('pagination.total', props.total)}
            </span>
          )}
          {renderPager()}
          {props.showPageSize && (
            <PageOptions
              sizeOptions={props.pageSizeOptions}
              pageSize={computedPageSize.value}
              size={props.size}
              onChange={handlePageSizeChange}
              selectProps={props.pageSizeProps}
            />
          )}
          {!props.simple && props.showJumper && (
            <PageJumper
              current={computedCurrent.value}
              pages={pages.value}
              size={props.size}
              onChange={handleClick}
            />
          )}
        </div>
      );
    };
  },
});