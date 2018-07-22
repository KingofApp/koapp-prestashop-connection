(function() {
  angular
    .module('prestashop', [])
    .service('prestashopService', prestashop);

  prestashop.$inject = ['$http', '$location', '$window', '$q'];

  function prestashop($http, $location, $window, $q) {
    const attrs = ['addresses', 'carriers', 'cart_rules', 'carts', 'categories',
      'combinations', 'configurations', 'contacts', 'content_management_system',
      'countries', 'currencies', 'customer_messages', 'customer_threads',
      'customers', 'customizations', 'deliveries', 'employees', 'groups',
      'guests', 'image_types', 'languages', 'manufacturers', 'messages',
      'order_carriers', 'order_details', 'order_histories', 'order_invoices',
      'order_payments', 'order_slip', 'order_states', 'orders', 'price_ranges',
      'product_customization_fields', 'product_feature_values', 'product_features',
      'product_option_values', 'product_options', 'product_suppliers', 'products',
      'shop_groups', 'shop_urls', 'shops', 'specific_price_rules', 'specific_prices',
      'states', 'stock_availables', 'stock_movement_reasons', 'stock_movements',
      'stocks', 'stores', 'suppliers', 'supply_order_details',
      'supply_order_histories', 'supply_order_receipt_histories',
      'supply_order_states', 'supply_orders', 'tags', 'tax_rule_groups',
      'tax_rules', 'taxes', 'translated_configurations', 'warehouse_product_locations',
      'warehouses', 'weight_ranges', 'zones'];
    var   api = {};

    return function(obj) {
      const url  = obj.url;
      const key  = obj.key;
      const base = 'http://' + _.replace(url, /(^https?:\/\/|\/$)/g, '');

      function ajax(method, path, data) {
        return $q(function(resolve, reject) {
          const url     = base + path;
          const headers = data ? { 'Content-Type' : 'text/xml;charset=UTF-8' } : {};
          return $http({
            method  : method,
            url     : url,
            data    : data,
            headers : headers
          }).then(function(response) {
            resolve(response.data);
          }).catch(function(e) {
            reject(e);
          });
        });
      }

      function search(query, filter) {
        return filter ?
          'filter[' + filter + ']=' + query :
          'filter[name]=%[' + query + ']%';
      }

      function display(query) {
        return query ?
          'display=[' + query + ']' :
          'display=full';
      }

      _.each(attrs, function(v) {
        api[ _.camelCase(v) ] = {
          add    : function(body)    { return ajax('POST',   '/api/' + v + '?output_format=JSON&ws_key=' + key, body); },
          modify : function(body)    { return ajax('PUT',    '/api/' + v + '?output_format=JSON&ws_key=' + key, body); },
          all    : function()        { return ajax('GET',    '/api/' + v + '?display=full&output_format=JSON&ws_key=' + key); },
          search : function(q, f, d) { return ajax('GET',    '/api/' + v + '?' + display(d) + '&output_format=JSON&ws_key=' + key + '&' + search(q, f)); },
          id     : function(id)      { return ajax('GET',    '/api/' + v + '/' + id + '?output_format=JSON&ws_key=' + key + '&price[total][use_tax]=1&price[total_tax_excl][use_tax]=0'); },
          delete : function(id)      { return ajax('DELETE', '/api/' + v + '/' + id + '?output_format=JSON&ws_key=' + key); },
          format : function()        { return ajax('GET',    '/api/' + v + '/' + id + '?output_format=JSON&ws_key=' + key + '&schema=blank'); }
        };
      });

      api.locale = function(count) {
        count = count || 0;

        const url      = 'http://www.geoplugin.net/json.gp';
        const method   = 'GET';
        return $http({
          method : method,
          url    : url
        }).then(function(response) {
          const iteratee = _.keys(response.data);
          const object   = {};

          for (var i in iteratee) {
            const key = _.replace(iteratee[i], 'geoplugin_', '');

            object[key] = response.data[ iteratee[i] ];
          }

          return object;
        }).catch(function(e) {
          // if it fail, try again
          return count === 5 ?
            e :
            api.locale(++count);
        });
      }

      api.favorite = {
        all    : function()   { return JSON.parse(localStorage.__FAVORITE__ || '[]'); },
        count  : function()   { return JSON.parse(localStorage.__FAVORITE__ || '[]').length; },
        id     : function(id) { return _.indexOf(JSON.parse(localStorage.__FAVORITE__ || '[]'), id) !== -1; },
        clear  : function()   { localStorage.removeItem('__FAVORITE__') },
        delete : function(id) {
          const cache  = JSON.parse(localStorage.__FAVORITE__ || '[]');
          const result = _.filter(cache, function(key) { return id !== key; });

          localStorage.__FAVORITE__ = JSON.stringify(result);
        },
        add    : function(id) {
          const cache  = JSON.parse(localStorage.__FAVORITE__ || '[]');

          if (id && _.indexOf(cache, id) === -1) {
            const result = _.concat(cache, id);

            localStorage.__FAVORITE__ = JSON.stringify(result);
          }
        }
      };

      api.toXML = function(fields, index = 0, root) {
        const keys  = _.keys(fields);
        var   xml   = '';
        var   tabs  = '';

        index = index || 0;

        for (var i = 0; i <= index; i++)
          tabs += '\t';

        if (!index) {
          xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
          xml += '<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">\n';
        }

        _.each(keys, function(v) {
          xml += tabs + '<' + (root || v) + '>';

          // text
          if (typeof fields[v] !== 'object')
            xml += fields[v];
          // array
          else if (fields[v] instanceof Array) {
            const key = _.replace(v, /s$/, '');
            xml += '\n' + api.toXML(fields[v], index + 1, key);
          }
          // object
          else
            xml += '\n' + api.toXML(fields[v], index + 1);

          // text
          if (typeof fields[v] !== 'object')
            xml += '</' + v + '>\n';
          // any object
          else
            xml += tabs + '</' + (root || v) + '>\n';
        })

        if (!index)
          xml += '</prestashop>';

        return xml;
      }

      return api;
    }
  }
}());
