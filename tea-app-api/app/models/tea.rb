class Tea < ApplicationRecord
  has_many :tea_requests

  validates :name_en, presence: true, uniqueness:true
  normalizes :category, with: ->(values) { values.map{ |values| values.strip}.uniq }

end
