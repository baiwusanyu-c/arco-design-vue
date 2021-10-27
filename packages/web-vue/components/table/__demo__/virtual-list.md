```yaml
title:
  zh-CN: 虚拟列表
  en-US: Virtual List
```

## zh-CN

设置 `virtual-list-props` 开启虚拟列表功能。
目前虚拟滚动表格受限比较多，开启虚拟滚动后不能使用展开行、树形数据、固定列等功能

---

## en-US

Set `virtual-list-props` to enable the virtual list function.
Currently, there are many restrictions on virtual scrolling tables. After enabling virtual scrolling, functions such as expanded rows, tree data, and fixed columns cannot be used.

---

```vue
<template>
  <a-table :columns="columns" :data="data" :virtual-list-props="{height:400}" :pagination="false"/>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
        },
        {
          title: 'Address',
          dataIndex: 'address',
        },
        {
          title: 'Email',
          dataIndex: 'email',
        },
      ],
      data: Array(1000).fill(null).map((_, index) => ({
        key: String(index),
        name: `User ${index + 1}`,
        address: '32 Park Road, London',
        email: `user.${index + 1}@example.com`
      }))
    }
  }
}
</script>
```