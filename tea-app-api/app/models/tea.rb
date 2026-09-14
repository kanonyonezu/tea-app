class Tea < ApplicationRecord
  has_many :tea_requests

  validates :name_en, presence: true, uniqueness:true
end
