require "open-uri"
require "nokogiri"
require "json"
class ScrapeGongchaJob < ApplicationJob
  queue_as :default

  def perform()

    # menu items

    categories = ["season", "teacraft", "straighttea", "milktea", "brownsugar", "frozentea", "fruittea", "fruitvinegar", "others"]

    tea_names = []
    categories.each do |category|
      url = "https://www.gongcha.co.jp/menu/category/#{category}/"
      html = URI.parse(url).read
      nokogiri_elements = Nokogiri::HTML.parse(html)

      nokogiri_elements.search('.c-list-card__txt-en').each do |tea|
        tea_names << tea.text.strip
      end
    end

    # stores
    japan_latitude_boundaries = [20.42, 45.33]
    japan_longitude_boundaries = [122.56, 153.59]

    url = "https://api.storepoint.co/v1/166d1c54519253/locations?"
    json_string = URI.parse(url).read
    json_object = JSON.parse(json_string)["results"]["locations"]

    # KOREA_SUFFIX_PATTERN = "/-(do|si|gu)\b/"

    stores = json_object.select do |store|
      in_bounding_box = store["loc_lat"].between?(*japan_latitude_boundaries) &&
        store["loc_long"].between?(*japan_longitude_boundaries)
      not_korea = !store["streetaddress"].to_s.include?("Korea")
      not_korea_do = !store["streetaddress"].match?("/-(do|si|gu)\b/")

      in_bounding_box && not_korea && not_korea_do
    end

    gongcha_stores = stores.map do |store|
      {
        name: store["name"].to_s,
        address: store["streetaddress"],
        longitude: store["loc_long"],
        latitude: store["loc_lat"]
      }
    end
    # p gongcha_stores.length
    # p gongcha_stores.sample(10).map { |s| s[:address] }


    # create the instances
    gongcha = Brand.find_or_create_by(name: "Gongcha")

    gongcha_stores.each do |store|
      shop = Shop.find_or_initialize_by(name: store[:name], brand: gongcha)
      shop.update!(
        address: store[:address],
        longitude: store[:longitude],
        latitude: store[:latitude],
        )
    end


    tea_names.each do |menu|
      MenuItem.find_or_create_by(name: menu, brand: gongcha)
    end

  end
end
