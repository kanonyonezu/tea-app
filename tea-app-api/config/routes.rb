Rails.application.routes.draw do
  # devise_for :users
  devise_for :users,
    path: 'api/v1',
    path_names: {sign_in: 'login', sign_out: 'logout'},
    controllers: {sessions: 'api/v1/sessions'},
    defaults: {format: :json}
  # /api/v1/teas
  namespace :api, defaults: {format: :json} do
    namespace :v1 do
      resources :teas, only: [:index, :show]
      # post "/recommendation", to: "teas#recommendation", as: :tea_recommendation
      resources :recommendations, only: [:create, :show]
    end
  end

end
