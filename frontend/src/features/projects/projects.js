export const projectKeys = {
    all: () => ['projects'],
    list: () => [...projectKeys.all(), 'list'],
    listWithParams: (params) => [...projectKeys.all(), 'list', params],
    details: () => [...projectKeys.all(), 'detail'],
    detail: (id) => [...projectKeys.details(), id],
    equipments: (id ) => [...projectKeys.all(), "equipments", id],
    categories: () => [...projectKeys.all(), 'categories'],
};
