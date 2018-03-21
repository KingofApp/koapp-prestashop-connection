(function() {
  angular
    .module('shopify', [])
    .service('sfConnectionService', shopifyConnectionService);

  shopifyConnectionService.$inject = ['$http', '$location', '$window'];

  function shopifyConnectionService($http, $location, $window) {
    const server = _.replace('http://localhost:3000', /\/$/, '');

    return function({ shop }) {
      function error(e) {
        console.error(e);
        return e;
      }

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
          error(e);
        }
      }

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

      const product = {
        all    : ()         => ajax('GET',   '/admin/products.json'),
        count  : ()         => ajax('GET',   '/admin/products/count.json'),
        id     : id         => ajax('GET',   `/admin/products/${id}.json`),
        create : body       => ajax('POST',  '/admin/products.json', body),
        modify : (id, body) => ajax('PUT',   `/admin/products/${id}.json`, body),
        delete : id         => ajax('DELETE' `/admin/products/${id}.json`)
      };

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

      const checkout = {
        all    : ()         => ajax('GET',    '/admin/checkouts.json'),
        count  : ()         => ajax('GET',    '/admin/checkouts/count.json'),
        id     : id         => ajax('GET',    `/admin/checkouts/${id}.json`),
        create : body       => ajax('POST',   '/admin/checkouts.json', body),
        modify : (id, body) => ajax('PUT',    `/admin/checkouts/${id}.json`, body)
      };

      return { collect, customCollection, giftCard, product, productImage, productVariant, smartCollection, checkout };
    }
  }
}());
