class Brand < ApplicationRecord
  has_many :shops
  has_many :menu_items
  has_many :teas, through: :menu_items

  validates :name, presence: true
end
