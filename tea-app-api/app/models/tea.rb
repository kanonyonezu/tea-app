class Tea < ApplicationRecord
  has_many :tea_requests
  has_many :menu_items
  has_many :brands, through: :menu_items

  validates :name_en, presence: true, uniqueness:true
  normalizes :category, with: ->(values) { values.map{ |values| values.strip}.uniq }

end
