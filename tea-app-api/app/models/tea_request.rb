class TeaRequest < ApplicationRecord
  belongs_to :user
  belongs_to :tea
end
