class Shop < ApplicationRecord
  belongs_to :brand
  has_many :menu_items, through: :brand
  has_many :teas, through: :menu_items

  validates :name, presence: true
  validates :address, presence: true
  validates :latitude, numericality: { in: -90..90 }, allow_nil: true
  validates :longitude, numericality: { in: -180..180 }, allow_nil: true
end
