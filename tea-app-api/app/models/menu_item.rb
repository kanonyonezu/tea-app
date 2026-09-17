class MenuItem < ApplicationRecord
  belongs_to :brand
  belongs_to :tea, optional: true

  validates :name, presence: true
end
