{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "records|1-3": [{
      id: '@id',
      name: '@@cparagraph(1, 1)',
      address: '@county(true)',
      lng: '113.23',
      lat: '23.22',
      'type|0-1': 0
    }],
    'total': function({
      _req
    }) {
      return this.records.length
    }
  }
}
