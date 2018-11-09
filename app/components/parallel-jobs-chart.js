import Component from '@ember/component';
import { computed } from 'ember-decorators/object';
import { service } from 'ember-decorators/service';
import $ from 'jquery';
import moment from 'moment';

import ObjectProxy from '@ember/object/proxy';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
let ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

let intervalMap = {
  day: {
    subInterval: '1hour',
    xAxisLabelFormat: '{value:%H:%M}',
  },
  week: {
    subInterval: '1day',
    xAxisLabelFormat: '{value:%b %e}',
  },
  month: {
    subInterval: '1day',
    xAxisLabelFormat: '{value:%b %e}',
  },
};

export default Component.extend({
  classNames: ['insights-odyssey'],
  classNameBindings: ['isLoading:insights-odyssey--loading'],

  @service storage: null,

  token: '',

  @computed('interval')
  options(interval) {
    return {
      title: { text: undefined, align: 'left', floating: false, color: '#666666' },
      xAxis: {
        type: 'datetime',
        lineColor: '#f3f3f3',
        labels: { format: intervalMap[interval].xAxisLabelFormat },
      },
      yAxis: {
        title: { text: undefined },
        gridLineDashStyle: 'Dash',
        gridLineColor: '#f3f3f3',
        lineWidth: 1,
        lineColor: '#f3f3f3',
        tickAmount: 6,
      },
      legend: {
      },
      chart: {
        type: 'area',
        height: '82%',
        plotBackgroundColor: '#fdfdfd',
      },
      plotOptions: {
        area: {
          step: 'center',
          marker: {
            enabled: false,
          },
        }
      },
    };
  },

  @computed('owner', 'interval', 'token')
  dataRequest(owner, interval, token) {
    // FIXME: replace with v3 calls when it is ready
    const apiToken = token || this.get('storage').getItem('travis.insightToken') || '';
    if (apiToken.length === 0) { return; }
    const insightEndpoint = 'https://travis-insights-production.herokuapp.com';
    let endTime = moment.utc();
    let startTime = moment.utc().subtract(1, interval);

    let insightParams = $.param({
      subject: 'jobs',
      interval: intervalMap[interval].subInterval,
      func: 'max',
      name: 'gauge_running,gauge_waiting',
      owner_type: owner['@type'] === 'user' ? 'User' : 'Organization',
      owner_id: owner.id,
      token: apiToken,
      end_time: endTime.format('YYYY-MM-DD HH:mm:ss UTC'),
      start_time: startTime.format('YYYY-MM-DD HH:mm:ss UTC'),
    });
    const url = `${insightEndpoint}/metrics?${insightParams}`;

    return ObjectPromiseProxy.create({
      promise: fetch(url).then(response => {
        if (response.ok) {
          return response.json();
        } else { return false; }
      }).then(response => ({data: response}))
    });
  },

  @computed('dataRequest.data')
  filteredData(data) {
    if (data) {
      const reducedData = data.values.reduce((timesMap, value) => {
        if (timesMap[value.name].hasOwnProperty(value.time)) {
          timesMap[value.name][value.time] += value.value;
        } else {
          timesMap[value.name][value.time] = value.value;
        }
        return timesMap;
      }, { gauge_running: {}, gauge_waiting: {} });
      return reducedData;
    }
  },

  @computed('filteredData')
  isLoading(filteredData) {
    return !filteredData;
  },

  @computed('filteredData')
  content(filteredData) {
    if (filteredData) {
      return [{
        name: 'Running Jobs',
        color: '#39aa56',
        fillColor: {
          linearGradient: [0, 0, 0, 300],
          stops: [
            [0, 'rgba(57, 170, 86, 0.7)'],
            [1, 'rgba(57, 170, 86, 0)'],
          ],
        },
        data: Object.entries(filteredData.gauge_running).map(
          ([key, val]) => [(new Date(key)).valueOf(), val]
        ),
      }, {
        name: 'Queued Jobs',
        color: '#3eaaaf',
        fillColor: {
          linearGradient: [0, 0, 0, 300],
          stops: [
            [0, 'rgba(62, 170, 175, 0.7)'],
            [1, 'rgba(62, 170, 175, 0)'],
          ],
        },
        data: Object.entries(filteredData.gauge_waiting).map(
          ([key, val]) => [(new Date(key)).valueOf(), val]
        ),
      }];
    }
  },
});
