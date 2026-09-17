class ScrapeTheAlleyJob < ApplicationJob
  queue_as :default

  def perform()
    require "open-uri"
    require "nokogiri"
    require "json"

    # menu items

    tea_names = []
    url = "https://tabelog.com/en/tokyo/A1301/A130102/13227539/dtlmenu/drink/"
    html = URI.parse(url).read
    nokogiri_elements = Nokogiri::HTML.parse(html)

    nokogiri_elements.search('.rstdtl-menu-lst__menu-title').each do |tea|
      tea_names << tea.text.strip.gsub(/\s*【.*?】/, '')
    end

    the_alley_tea_names = tea_names[2...-2]



    # stores
    url = "https://www.the-alley.jp/store.html?20260326"
    html = URI.parse(url).read
    nokogiri_elements = Nokogiri::HTML.parse(html)

    stores = nokogiri_elements.search('.content-area:not(.hide) li.store_name').map do |store_name_el|
      parent_li = store_name_el.parent
      name = store_name_el.text.strip.gsub(/\s+/, ' ')
      address = parent_li.at_css('.store_info .address')&.text&.strip

      { name: name, address: address }
    end


    # create the instances
    the_alley = Brand.find_or_create_by(name: "TheAlley")

    stores.each do |store|
      shop = Shop.find_or_initialize_by(name: store[:name], brand: the_alley)
      shop.update!(
        address: store[:address],
        longitude: store[:longitude],
        latitude: store[:latitude],
        )
    end


    the_alley_tea_names.each do |menu|
      MenuItem.find_or_create_by(name: menu, brand: the_alley)
    end

  end
end
