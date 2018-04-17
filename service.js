(function() {
  angular
    .module('shopify', [])
    .service('sfConnectionService', shopifyConnectionService);

  shopifyConnectionService.$inject = ['$http', '$location', '$window'];

  function shopifyConnectionService($http, $location, $window) {
    const server = 'https://koapp-oauth.herokuapp.com';
    // const server = 'http://localhost:3000';

    return function({ shop }) {
      const auth = () =>
        localStorage.__SHOPIFY__ ?
          Promise.resolve(localStorage.__SHOPIFY__) :
          new Promise(resolve => {
            window.onmessage = event => {
              const data = event.data;
              localStorage.__SHOPIFY__ = event.data.access_token;
              resolve(localStorage.__SHOPIFY__);
            };
            $window.open(`${server}/shopify/shop/${shop}`, '_blank');
          }) 

      async function ajax(method, path, json) {
        try {
          const access_token = await auth();
          const url          = `${server}/shopify`;
          const data         = { shop, access_token, json, method, path };
          const response     = await $http.post(url, data);
          return response.data;
        }
        catch(e) {
          console.error(e);
        }
      }

        /*
      const collect = {
        create : body => ajax('POST',   '/admin/collects.json', body),
        delete : id   => ajax('DELETE', `/admin/collects/${id}.json`),
        all    : id   => ajax('GET',    `/admin/collects.json?product_id=${id}`),
        count  : id   => ajax('GET',    `/admin/collects/count.json?product_id=${id}`),
        id     : id   => ajax('GET',    `/admin/collects/${id}.json`)
      };

      const customCollection = {
        all    : id         => ajax('GET',    `/admin/custom_collections.json?since_id=${id}`),
        count  : id         => ajax('GET',    `/admin/custom_collections/count.json?product_id=${id}`),
        id     : id         => ajax('GET',    `/admin/custom_collections/${id}.json`),
        create : body       => ajax('POST',   '/admin/custom_collections.json', body),
        modify : (id, body) => ajax('PUT',    `/admin/custom_collections/${id}.json`, body),
        delete : id         => ajax('DELETE', `/admin/custom_collections/${id}.json`)
      };

      const giftCard = {
        all    : ()         => ajax('GET',  '/admin/gift_cards.json?status=enabled'),
        id     : id         => ajax('GET',  `/admin/gift_cards/${id}.json`),
        count  : ()         => ajax('GET',  `/admin/gift_cards/count.json?status=enabled`),
        create : body       => ajax('POST', '/admin/gift_cards.json', body),
        modify : (id, body) => ajax('PUT',  `/admin/gift_cards/${id}.json`, body),
        delete : id         => ajax('POST', `/admin/gift_cards/${id}/disable.json`),
        search : name       => ajax('GET',  `/admin/gift_cards/search.json?query=${name}`)
      };
      */

      const product = {
        all    : ()         => ajax('GET',   '/admin/products.json'),
        count  : ()         => ajax('GET',   '/admin/products/count.json'),
        id     : id         => ajax('GET',   `/admin/products/${id}.json`),
        create : body       => ajax('POST',  '/admin/products.json', body),
        modify : (id, body) => ajax('PUT',   `/admin/products/${id}.json`, body),
        delete : id         => ajax('DELETE' `/admin/products/${id}.json`)
      };

      const productListing = {
        all    : ()         => ajax('GET',   '/admin/product_listings.json'),
        count  : ()         => ajax('GET',   '/admin/product_listings/count.json'),
        id     : id         => ajax('GET',   `/admin/product_listings/${id}.json`),
        create : body       => ajax('PUT',   `/admin/product_listings/${id}.json`, body),
        delete : id         => ajax('DELETE' `/admin/product_listings/${id}.json`)
      };

      /*
      const productImage = {
        all    : id         => ajax('GET',    `/admin/products/${id}/images.json`),
        count  : id         => ajax('GET',    `/admin/products/${id}/images/count.json`),
        id     : id         => ajax('GET',    `/admin/products/#{id}/images/${id}.json`),
        create : (id, body) => ajax('POST',   `/admin/products/${id}/images.json`, body),
        modify : (id, body) => ajax('PUT',    `/admin/products/${id}/images/${id}.json`, body),
        delete : id         => ajax('DELETE', `/admin/products/${id}/images/${id}.json`)
      };

      const productVariant = {
        all    : id         => ajax('GET',    `/admin/products/${id}/variants.json?since_id=${id}`),
        count  : id         => ajax('GET',    `/admin/products/${id}/variants/count.json`),
        id     : id         => ajax('GET',    `/admin/variants/${id}.json`),
        create : (id, body) => ajax('POST',   `/admin/products/${id}/variants.json`, body),
        modify : (id, body) => ajax('PUT',    `/admin/variants/${id}.json`, body),
        delete : id         => ajax('DELETE', `/admin/products/${id}/variants/${id}.json`)
      };

      const smartCollection = {
        all    : ()         => ajax('GET',    '/admin/smart_collections.json'),
        count  : ()         => ajax('GET',    '/admin/smart_collections/count.json'),
        id     : id         => ajax('GET',    `/admin/smart_collections/${id}.json`),
        create : body       => ajax('POST',   '/admin/smart_collections.json', body),
        modify : (id, body) => ajax('PUT',    `/admin/smart_collections/${id}.json`, body),
        // ?   : (id, body) => ajax('PUT',    `/admin/smart_collections/#{id}/order.json?products[]=921728736&products[]=632910392`, body),
        delete : id         => ajax('DELETE', `/admin/smart_collections/${id}.json`)
      };
      */

      const checkout = {
        all    : ()         => ajax('GET',  '/admin/checkouts.json'),
        count  : ()         => ajax('GET',  '/admin/checkouts/count.json'),
        id     : id         => ajax('GET',  `/admin/checkouts/${id}.json`),
        create : body       => ajax('POST', '/admin/checkouts.json', body),
        modify : (id, body) => ajax('PUT',  `/admin/checkouts/${id}.json`, body)
      };

      /*
      const order = {
        all    : ()         => ajax('GET',  '/admin/orders.json'),
        count  : ()         => ajax('GET',  '/admin/orders/count.json'),
        id     : id         => ajax('GET',  `/admin/orders/${id}.json`),
        create : body       => ajax('POST', '/admin/orders.json', body),
        modify : (id, body) => ajax('PUT',  `/admin/orders/${id}.json`, body)
      };
      */

      const cart = {
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

      const favorite = {
        all    : ()         => JSON.parse(localStorage.__FAVORITE__ || '[]'),
        count  : ()         => JSON.parse(localStorage.__FAVORITE__ || '[]').length,
        id     : id         => _.indexOf(JSON.parse(localStorage.__FAVORITE__ || '[]'), id) !== -1,
        clear  : ()         => { localStorage.removeItem('__FAVORITE__') },
        delete : id         => {
          const cache  = JSON.parse(localStorage.__FAVORITE__ || '[]');
          const result = _.filter(cache, key => id !== key);

          localStorage.__FAVORITE__ = JSON.stringify(result);
        },
        add    : id         => {
          const cache  = JSON.parse(localStorage.__FAVORITE__ || '[]');

          if (id && _.indexOf(cache, id) === -1) {
            const result = _.concat(cache, id);

            localStorage.__FAVORITE__ = JSON.stringify(result);
          }
        }
      };

      const customer = {
        all    : ()         => ajax('GET',  '/admin/customers.json'),
        count  : ()         => ajax('GET',  '/admin/customers/count.json'),
        id     : id         => ajax('GET',  `/admin/customers/${id}.json`),
        create : body       => ajax('POST', '/admin/customers.json', body),
        modify : (id, body) => ajax('PUT',  `/admin/customers/${id}.json`, body)
      };

      const blog = {
        all    : ()         => ajax('GET',  '/admin/blogs.json'),
        count  : ()         => ajax('GET',  '/admin/blogs/count.json'),
        id     : id         => ajax('GET',  `/admin/blogs/${id}.json`),
        create : body       => ajax('POST', '/admin/blogs.json', body),
        modify : (id, body) => ajax('PUT',  `/admin/blogs/${id}.json`, body)
      };

      const article = {
        all    : blog             => ajax('GET',  `/admin/blogs/${blog}/articles.json`),
        count  : blog             => ajax('GET',  `/admin/blogs/${blog}/articles/count.json`),
        id     : (blog, id)       => ajax('GET',  `/admin/blogs/${blog}/articles/${id}.json`),
        create : (blog, body)     => ajax('POST', `/admin/blogs/${blog}/articles.json`, body),
        modify : (id, blog, body) => ajax('PUT',  `/admin/blogs/${blog}/articles/${id}.json`, body)
      };

      const page = {
        all    : ()         => ajax('GET',  '/admin/pages.json'),
        count  : ()         => ajax('GET',  '/admin/pages/count.json'),
        id     : id         => ajax('GET',  `/admin/pages/${id}.json`),
        create : body       => ajax('POST', '/admin/pages.json', body),
        modify : (id, body) => ajax('PUT',  `/admin/pages/${id}.json`, body)
      };

      return { product, productListing, checkout, blog, article, page, cart, favorite, customer };
    }
  }
}());
