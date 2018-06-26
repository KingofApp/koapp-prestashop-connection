(function() {
  angular
    .module('prestashop', [])
    .service('prestashopService', prestashop);

  prestashop.$inject = ['$http', '$location', '$window'];

  function prestashop($http, $location, $window) {
    const attrs = ["addresses", "carriers", "cart_rules", "carts", "categories",
      "combinations", "configurations", "contacts", "content_management_system",
      "countries", "currencies", "customer_messages", "customer_threads",
      "customers", "customizations", "deliveries", "employees", "groups",
      "guests", "image_types", "languages", "manufacturers", "messages",
      "order_carriers", "order_details", "order_histories", "order_invoices",
      "order_payments", "order_slip", "order_states", "orders", "price_ranges",
      "product_customization_fields", "product_feature_values", "product_features",
      "product_option_values", "product_options", "product_suppliers", "products",
      "shop_groups", "shop_urls", "shops", "specific_price_rules", "specific_prices",
      "states", "stock_availables", "stock_movement_reasons", "stock_movements",
      "stocks", "stores", "suppliers", "supply_order_details",
      "supply_order_histories", "supply_order_receipt_histories",
      "supply_order_states", "supply_orders", "tags", "tax_rule_groups",
      "tax_rules", "taxes", "translated_configurations", "warehouse_product_locations",
      "warehouses", "weight_ranges", "zones"];
    let   api = {};

    return function({ url, key }) {
      const base = 'http://' + _.replace(url, /(^https?:\/\/|\/$)/g, '');

      async function ajax(method, path, data) {
        try {
          const url      = base + path;
          const headers  = data ? { 'Content-Type' : 'text/xml;charset=UTF-8' } : {};
          const response = await $http({ method, url, data, headers });
          return response.data;
        }
        catch(e) {
          console.error(e);
          throw e;
        }
      }

      const search  = (query, filter) =>
        filter ? `filter[${filter}]=${query}` : `filter[name]=%[${query}]%`;

      const display = query =>
        query ? `display=[${query}]` : 'display=full';

      _.each(attrs, v => {
        api[ _.camelCase(v) ] = {
          add    : body       => ajax('POST',   `/api/${v}?output_format=JSON&ws_key=${key}`, body),
          modify : body       => ajax('PUT',    `/api/${v}?output_format=JSON&ws_key=${key}`, body),
          all    : ()         => ajax('GET',    `/api/${v}?display=full&output_format=JSON&ws_key=${key}`),
          search : (q, f, d)  => ajax('GET',    `/api/${v}?${display(d)}&output_format=JSON&ws_key=${key}&${search(q, f)}`),
          id     : id         => ajax('GET',    `/api/${v}/${id}?output_format=JSON&ws_key=${key}&price[total][use_tax]=1&price[total_tax_excl][use_tax]=0`),
          delete : id         => ajax('DELETE', `/api/${v}/${id}?output_format=JSON&ws_key=${key}`),
          format : ()         => ajax('GET',    `/api/${v}/${id}?output_format=JSON&ws_key=${key}&schema=blank`)
        };
      });

      api.locale = async (count = 0) => {
        try {
          const url      = 'http://www.geoplugin.net/json.gp';
          const method   = 'GET';
          const response = await $http({ method, url });
          const iteratee = _.keys(response.data);
          let   object   = {};

          for (let i in iteratee) {
            const key = _.replace(iteratee[i], 'geoplugin_', '');

            object[key] = response.data[ iteratee[i] ];
          }

          return object;
        }
        catch(e) {
          // if it fail, try again
          return count === 5 ?
            e :
            api.locale(++count);
        }
      }

      /*
      api.search = (language, query) =>
        ajax('GET', `/api/search?language=${language}&query=${query}&output_format=JSON&ws_key=${key}`)

      api.cart = {
        all    : ()         => JSON.parse(localStorage.__CART__ || '{}'),
        count  : ()         => _.keys(JSON.parse(localStorage.__CART__ || '{}')).length,
        id     : id         => JSON.parse(localStorage.__CART__ || '{}')[id],
        clear  : ()         => { localStorage.removeItem('__CART__') },
        delete : id         => {
          const cache  = JSON.parse(localStorage.__CART__ || '{}');
          const result = _.omit(cache, id);

          localStorage.__CART__ = JSON.stringify(result);
        },
        add    : (id, body) => {
          const cache  = JSON.parse(localStorage.__CART__ || '{}');
          const object = eval(`({ ${id} : body })`);
          const result = _.assign(cache, object);

          localStorage.__CART__ = JSON.stringify(result);
        }
      };
      */

      api.favorite = {
        all    : () => JSON.parse(localStorage.__FAVORITE__ || '[]'),
        count  : () => JSON.parse(localStorage.__FAVORITE__ || '[]').length,
        id     : id => _.indexOf(JSON.parse(localStorage.__FAVORITE__ || '[]'), id) !== -1,
        clear  : () => { localStorage.removeItem('__FAVORITE__') },
        delete : id => {
          const cache  = JSON.parse(localStorage.__FAVORITE__ || '[]');
          const result = _.filter(cache, key => id !== key);

          localStorage.__FAVORITE__ = JSON.stringify(result);
        },
        add    : id => {
          const cache  = JSON.parse(localStorage.__FAVORITE__ || '[]');

          if (id && _.indexOf(cache, id) === -1) {
            const result = _.concat(cache, id);

            localStorage.__FAVORITE__ = JSON.stringify(result);
          }
        }
      };

      api.toXML = (fields, index = 0, root) => {
        const keys  = _.keys(fields);
        let   xml   = '';
        let   tabs  = '';

        for (let i = 0; i <= index; i++)
          tabs += '\t';

        if (!index) {
          xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
          xml += '<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">\n';
        }

        _.each(keys, v => {
          xml += `${tabs}<${root || v}>`;

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
            xml += `</${v}>\n`;
          // any object
          else
            xml += `${tabs}</${root || v}>\n`;
        })

        if (!index)
          xml += '</prestashop>';

        return xml;
      }

      return api;
    }
  }
}());
