# frozen_string_literal: true

# Plugin to swap in French markdown content when building the site with lang: fr-FR
Jekyll::Hooks.register :site, :post_read do |site|
  if site.config['lang'] == 'fr-FR'
    fr_posts_dir = File.join(site.source, '_posts_fr')
    if Dir.exist?(fr_posts_dir)
      site.posts.docs.each do |post|
        filename = File.basename(post.path)
        fr_post_path = File.join(fr_posts_dir, filename)

        if File.exist?(fr_post_path)
          fr_doc = Jekyll::Document.new(fr_post_path, site: site, collection: site.posts)
          fr_doc.read

          post.data['title'] = fr_doc.data['title'] if fr_doc.data['title']
          post.data['description'] = fr_doc.data['description'] if fr_doc.data['description']
          post.content = fr_doc.content
        end
      end
    end
  end
end
